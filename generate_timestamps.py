import os
import re
import argparse
import requests
import json
from faster_whisper import WhisperModel

# Diccionario de páginas iniciales de los Juzs
JUZ_STARTING_PAGES = [
    2, 22, 42, 62, 82, 102, 122, 142, 162, 182,
    202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
]

def clean_arabic(text):
    if not text:
        return ""
    # Quitar diacríticos (tashkeel/harakat)
    harakat = re.compile(r'[\u064B-\u065F\u0670]')
    text = harakat.sub('', text)
    # Normalizar alef, ya, heh
    text = re.sub(r'[أإآٱ]', 'ا', text)
    text = re.sub(r'ى', 'ي', text)
    text = re.sub(r'ة', 'ه', text)
    # Quitar símbolos especiales y números de aleya
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def fetch_verses(absolute_page):
    url = f"https://api.quran.com/api/v4/verses/by_page/{absolute_page}?words=false&translations=false&fields=text_uthmani"
    print(f"Descargando aleyas oficiales para la página {absolute_page} desde quran.com...")
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    data = response.json()
    
    verses = []
    for v in data.get("verses", []):
        verses.append({
            "verse_key": v["verse_key"],
            "verse_number": v["verse_number"],
            "text": v["text_uthmani"],
            "clean_text": clean_arabic(v["text_uthmani"])
        })
    return verses

def align_timestamps(verses, words_with_time):
    """
    Alinea las palabras de Whisper con las aleyas oficiales de forma secuencial.
    """
    aligned = {}
    
    # Preparar las palabras de las aleyas oficiales
    official_words_by_verse = []
    for v in verses:
        words = [clean_arabic(w) for w in v["clean_text"].split() if clean_arabic(w)]
        official_words_by_verse.append((v["verse_key"], words))
        
    print(f"Alineando {len(words_with_time)} palabras transcritas por Whisper con {len(verses)} aleyas oficiales...")
    
    # Puntero para recorrer las palabras de Whisper
    whisper_idx = 0
    num_whisper_words = len(words_with_time)
    
    for verse_key, official_words in official_words_by_verse:
        if not official_words or whisper_idx >= num_whisper_words:
            # Fallback en caso de que no haya palabras
            continue
            
        verse_start_time = words_with_time[whisper_idx]["start"]
        verse_end_time = words_with_time[whisper_idx]["end"]
        
        # Intentamos emparejar cada palabra oficial secuencialmente
        matched_words = 0
        for off_word in official_words:
            # Buscamos en las palabras de Whisper hacia adelante
            best_match_idx = -1
            # Buscamos en una ventana de las próximas 15 palabras de Whisper
            for step in range(15):
                curr_idx = whisper_idx + step
                if curr_idx >= num_whisper_words:
                    break
                w_word = clean_arabic(words_with_time[curr_idx]["word"])
                if off_word == w_word or off_word in w_word or w_word in off_word:
                    best_match_idx = curr_idx
                    break
            
            if best_match_idx != -1:
                # Si encontramos coincidencia, avanzamos nuestro puntero de Whisper
                verse_end_time = words_with_time[best_match_idx]["end"]
                whisper_idx = best_match_idx + 1
                matched_words += 1
            else:
                # Si no hay coincidencia, simplemente asumimos el avance de 1 palabra en Whisper
                if whisper_idx < num_whisper_words:
                    verse_end_time = words_with_time[whisper_idx]["end"]
                    whisper_idx += 1
        
        aligned[verse_key] = {
            "start": round(verse_start_time, 2),
            "end": round(verse_end_time, 2)
        }
    
    # Ajuste fino: conectar el final de una aleya con el inicio de la siguiente para que no haya huecos
    keys = list(aligned.keys())
    for i in range(len(keys) - 1):
        curr_key = keys[i]
        next_key = keys[i+1]
        
        # Si hay un hueco, hacemos que coincidan
        avg_time = round((aligned[curr_key]["end"] + aligned[next_key]["start"]) / 2, 2)
        aligned[curr_key]["end"] = avg_time
        aligned[next_key]["start"] = avg_time
        
    return aligned

def main():
    parser = argparse.ArgumentParser(description="Generar timestamps para aleyas usando Whisper")
    parser.add_argument("--vuelta", type=int, default=1, help="Numero de vuelta (1 o 2)")
    parser.add_argument("--juz", type=int, default=1, help="Numero de Juz (1 al 30)")
    parser.add_argument("--model", type=str, default="base", help="Modelo Whisper (tiny, base, small)")
    
    args = parser.parse_args()
    
    vuelta_id = args.vuelta
    juz_id = args.juz
    
    # Cálculos de paginación
    page_id = 21 - vuelta_id
    local_page_number = (juz_id - 1) * 20 + page_id
    absolute_page = JUZ_STARTING_PAGES[juz_id - 1] + page_id - 1
    
    audio_path = f"public/Coran/{vuelta_id}V/KRH/P{local_page_number}.mp4"
    json_path = f"public/Coran/{vuelta_id}V/KRH/P{local_page_number}.json"
    
    if not os.path.exists(audio_path):
        print(f"Error: No se encontró el archivo de audio en {audio_path}")
        return
        
    print(f"Procesando Juz {juz_id}, Vuelta {vuelta_id} (Página {local_page_number})")
    print(f"Archivo de audio: {audio_path}")
    
    # 1. Fetch verses
    try:
        verses = fetch_verses(absolute_page)
    except Exception as e:
        print(f"Error al descargar las aleyas oficiales: {e}")
        return
        
    if not verses:
        print("Error: No se obtuvieron aleyas para esta página.")
        return

    # 2. Cargar Whisper
    print(f"Cargando modelo Whisper '{args.model}' (esto puede tardar en la primera ejecución)...")
    # faster-whisper descarga y almacena en caché el modelo automáticamente
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    
    # 3. Transcribir
    print("Transcribiendo audio y extrayendo timestamps por palabra...")
    segments, info = model.transcribe(audio_path, language="ar", word_timestamps=True)
    
    # Aplanar la lista de palabras
    words_with_time = []
    for segment in segments:
        if segment.words:
            for w in segment.words:
                words_with_time.append({
                    "word": w.word,
                    "start": w.start,
                    "end": w.end
                })
                
    if not words_with_time:
        print("Error: Whisper no detectó palabras en el audio.")
        return
        
    # 4. Alinear
    aligned_data = align_timestamps(verses, words_with_time)
    
    # Asegurar que el inicio del primer versículo sea 0.0
    first_key = verses[0]["verse_key"]
    if first_key in aligned_data:
        aligned_data[first_key]["start"] = 0.0
        
    # Guardar en archivo JSON
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(aligned_data, f, ensure_ascii=False, indent=2)
        
    print(f"¡Éxito! Timestamps generados y guardados en {json_path}")
    print(json.dumps(aligned_data, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
