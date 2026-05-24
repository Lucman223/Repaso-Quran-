import os
import re
import argparse
import requests
import json
from faster_whisper import WhisperModel
from pydub import AudioSegment

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

def levenshtein_distance(s1, s2):
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (0 if c1 == c2 else 1)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
        
    return previous_row[-1]

def get_similarity(word1, word2):
    w1 = clean_arabic(word1)
    w2 = clean_arabic(word2)
    if not w1 or not w2:
        return 0.0
    if w1 == w2:
        return 2.0
    if w1 in w2 or w2 in w1:
        return 1.0
    dist = levenshtein_distance(w1, w2)
    max_len = max(len(w1), len(w2))
    if dist < max_len * 0.4:
        return 0.5
    return 0.0

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

def align_needleman_wunsch(official_words_info, whisper_words):
    M = len(official_words_info)
    N = len(whisper_words)
    
    # Penalizaciones
    gap_official = -1.0
    gap_whisper = -0.5  # Penalización menor para saltar palabras de Whisper (para permitir rebobinados/repeticiones)
    
    dp = [[0.0] * (N + 1) for _ in range(M + 1)]
    
    # Inicializar bordes
    for i in range(1, M + 1):
        dp[i][0] = dp[i-1][0] + gap_official
    for j in range(1, N + 1):
        dp[0][j] = dp[0][j-1] + gap_whisper
        
    # Llenar la matriz
    for i in range(1, M + 1):
        off_w = official_words_info[i-1]["word"]
        for j in range(1, N + 1):
            wh_w = whisper_words[j-1]["word"]
            
            sim = get_similarity(off_w, wh_w)
            
            match_score = dp[i-1][j-1] + (sim if sim > 0 else -1.5)
            gap_off_score = dp[i-1][j] + gap_official
            gap_wh_score = dp[i][j-1] + gap_whisper
            
            dp[i][j] = max(match_score, gap_off_score, gap_wh_score)
            
    # Traceback para reconstruir el alineamiento
    alignment = []
    i, j = M, N
    while i > 0 or j > 0:
        if i > 0 and j > 0:
            off_w = official_words_info[i-1]["word"]
            wh_w = whisper_words[j-1]["word"]
            sim = get_similarity(off_w, wh_w)
            match_score = dp[i-1][j-1] + (sim if sim > 0 else -1.5)
            
            if dp[i][j] == match_score:
                alignment.append((i-1, j-1))
                i -= 1
                j -= 1
                continue
                
        if i > 0:
            gap_off_score = dp[i-1][j] + gap_official
            if dp[i][j] == gap_off_score or j == 0:
                alignment.append((i-1, None))
                i -= 1
                continue
                
        if j > 0:
            alignment.append((None, j-1))
            j -= 1
            
    alignment.reverse()
    return alignment

def find_optimal_cut_point(audio, start_s, end_s):
    start_ms = int(start_s * 1000)
    end_ms = int(end_s * 1000)
    
    if start_ms >= end_ms:
        return (start_ms + end_ms) // 2
        
    duration = end_ms - start_ms
    transition_segment = audio[start_ms:end_ms]
    
    window_len = 20  # ms
    step = 5         # ms
    min_rms = float('inf')
    best_offset_ms = duration // 2
    
    for offset in range(0, max(1, duration - window_len), step):
        chunk = transition_segment[offset:offset + window_len]
        if len(chunk) == 0:
            continue
        if chunk.rms < min_rms:
            min_rms = chunk.rms
            best_offset_ms = offset + (len(chunk) // 2)
            
    return start_ms + best_offset_ms

def main():
    parser = argparse.ArgumentParser(description="Procesar y trocear audio de KRH en aleyas individuales")
    parser.add_argument("--vuelta", type=int, default=1, help="Número de vuelta")
    parser.add_argument("--juz", type=int, default=1, help="Número de Juz")
    parser.add_argument("--model", type=str, default="base", help="Modelo Whisper")
    
    args = parser.parse_args()
    
    vuelta_id = args.vuelta
    juz_id = args.juz
    
    # Cálculos de paginación
    page_id = 21 - vuelta_id
    local_page_number = (juz_id - 1) * 20 + page_id
    absolute_page = JUZ_STARTING_PAGES[juz_id - 1] + page_id - 1
    
    audio_path = f"public/Coran/{vuelta_id}V/KRH/P{local_page_number}.mp4"
    output_dir = f"public/Coran/{vuelta_id}V/KRH/Audios"
    
    if not os.path.exists(audio_path):
        print(f"Error: No se encontró el archivo de audio en {audio_path}")
        return
        
    print(f"--- Iniciando Procesamiento con Alineación NW ---")
    print(f"Juz: {juz_id}, Vuelta: {vuelta_id} -> Página local: P{local_page_number} (Absoluta: {absolute_page})")
    
    # 1. Obtener aleyas oficiales
    try:
        verses = fetch_verses(absolute_page)
    except Exception as e:
        print(f"Error al descargar aleyas: {e}")
        return
        
    if not verses:
        print("Error: No se obtuvieron aleyas.")
        return
        
    # Aplanar palabras oficiales y guardar su verse_key asociado
    official_words_info = []
    for v in verses:
        words = [clean_arabic(w) for w in v["text"].split() if clean_arabic(w)]
        for w in words:
            official_words_info.append({
                "word": w,
                "verse_key": v["verse_key"]
            })
            
    # 2. Cargar Whisper y transcribir
    print(f"Cargando Whisper Model '{args.model}'...")
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    
    print("Transcribiendo...")
    segments, info = model.transcribe(audio_path, language="ar", word_timestamps=True)
    
    whisper_words = []
    for segment in segments:
        if segment.words:
            for w in segment.words:
                whisper_words.append({
                    "word": w.word,
                    "start": w.start,
                    "end": w.end
                })
                
    if not whisper_words:
        print("Error: No se detectaron palabras en el audio.")
        return
        
    # 3. Alineación Needleman-Wunsch
    print("Realizando alineación Needleman-Wunsch...")
    alignment = align_needleman_wunsch(official_words_info, whisper_words)
    
    # Calcular tiempos estimados por aleya
    verse_times = {}
    for v in verses:
        verse_key = v["verse_key"]
        
        # Filtrar palabras alineadas para esta aleya
        indices_in_verse = [i for i, (off_idx, wh_idx) in enumerate(alignment) 
                            if off_idx is not None and official_words_info[off_idx]["verse_key"] == verse_key]
        
        # Encontrar los correspondientes de Whisper
        wh_indices = [alignment[idx][1] for idx in indices_in_verse if alignment[idx][1] is not None]
        
        if wh_indices:
            start_time = whisper_words[min(wh_indices)]["start"]
            end_time = whisper_words[max(wh_indices)]["end"]
            verse_times[verse_key] = {
                "start": start_time,
                "end": end_time
            }
        else:
            verse_times[verse_key] = None
            
    # Rellenar aleyas no emparejadas con interpolación
    keys = [v["verse_key"] for v in verses]
    for idx, verse_key in enumerate(keys):
        if verse_times[verse_key] is None:
            # Buscar anterior válido
            prev_time = 0.0
            for p in range(idx - 1, -1, -1):
                if verse_times[keys[p]] is not None:
                    prev_time = verse_times[keys[p]]["end"]
                    break
            # Buscar posterior válido
            next_time = info.duration if info else 180.0
            for n in range(idx + 1, len(keys)):
                if verse_times[keys[n]] is not None:
                    next_time = verse_times[keys[n]]["start"]
                    break
            # Punto medio
            avg = (prev_time + next_time) / 2
            verse_times[verse_key] = {
                "start": max(prev_time, avg - 1.0),
                "end": min(next_time, avg + 1.0)
            }
            print(f"Advertencia: Aleya {verse_key} interpolada ({verse_times[verse_key]['start']:.2f}s - {verse_times[verse_key]['end']:.2f}s)")

    # 4. Carga de audio para recorte con pydub
    print("Cargando archivo de audio...")
    audio = AudioSegment.from_file(audio_path)
    total_duration_ms = len(audio)
    
    # 5. Calcular los puntos de corte óptimos
    cut_points = {}
    cut_points[keys[0]] = {"start": 0}
    
    for i in range(len(keys) - 1):
        curr_key = keys[i]
        next_key = keys[i+1]
        
        end_curr = verse_times[curr_key]["end"]
        start_next = verse_times[next_key]["start"]
        
        # Encontrar punto de corte en silencio inter-aleya
        cut_ms = find_optimal_cut_point(audio, end_curr, start_next)
        
        cut_points[curr_key]["end"] = cut_ms
        cut_points[next_key] = {"start": cut_ms}
        
    cut_points[keys[-1]]["end"] = total_duration_ms
    
    # 6. Exportar a MP3
    os.makedirs(output_dir, exist_ok=True)
    print("Exportando a MP3...")
    for verse_key in keys:
        start_ms = cut_points[verse_key]["start"]
        end_ms = cut_points[verse_key]["end"]
        
        if start_ms >= end_ms:
            # Fallback en caso de corte inválido
            start_ms = max(0, end_ms - 1000)
            
        verse_audio = audio[start_ms:end_ms]
        
        sura, ayah = verse_key.split(":")
        filename = f"{sura.zfill(3)}{ayah.zfill(3)}.mp3"
        filepath = os.path.join(output_dir, filename)
        
        print(f"Exportando {verse_key} ({start_ms/1000:.2f}s - {end_ms/1000:.2f}s) -> {filepath}")
        verse_audio.export(filepath, format="mp3", bitrate="128k")
        
    print(f"¡Procesamiento completado con éxito! Se han exportado {len(keys)} aleyas.")

if __name__ == "__main__":
    main()
