export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
}

export type Reciter = 'krh' | 'husary' | 'minshawi';

export const RECITERS = {
  krh: { nameAr: 'ك. ر. هـ', nameEs: 'K.R.H.' },
  husary: { nameAr: 'محمود خليل الحصري', nameEs: 'Al-Husary' },
  minshawi: { nameAr: 'محمد صديق المنشاوي', nameEs: 'Minshawi (Mujawwad)' },
} as const satisfies Record<Reciter, { nameAr: string; nameEs: string }>;

export const JUZ_STARTING_PAGES = [
  2, 22, 42, 62, 82, 102, 122, 142, 162, 182,
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export const AVAILABLE_VUELTAS = [1, 2];

export function getAyahAudioUrl(verseKey: string, reciter: Reciter = 'minshawi'): string {
  // verseKey viene como "1:1" -> necesitamos "001001"
  const [sura, ayah] = verseKey.split(':');
  const suraPad = sura.padStart(3, '0');
  const ayahPad = ayah.padStart(3, '0');
  const file = `${suraPad}${ayahPad}`;

  if (reciter === 'krh') {
    // Cuando el usuario tenga las aleyas troceadas, se guardarán aquí:
    // (Ajustaremos la ruta si es necesario, de momento asumimos que van a /Coran/Audios/KRH/)
    return `/Coran/Audios/KRH/${file}.mp3`;
  }
  if (reciter === 'husary') {
    return `https://everyayah.com/data/Husary_128kbps/${file}.mp3`;
  }
  return `https://everyayah.com/data/Minshawy_Mujawwad_192kbps/${file}.mp3`;
}

// Nueva función para obtener el audio de la página completa (para la transición de K.R.H.)
export function getPageAudioUrl(absolutePage: number, vueltaId: string): string {
  return `/Coran/${vueltaId}V/KRH/P${absolutePage}.mp4`;
}

export async function fetchPageVerses(absolutePage: number): Promise<Verse[]> {
  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_page/${absolutePage}?words=false&translations=false&fields=text_uthmani`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return (data.verses ?? []).map((v: Record<string, unknown>) => ({
    id: Number(v.id),
    verse_key: String(v.verse_key),
    verse_number: Number(v.verse_number),
    text_uthmani: String(v.text_uthmani),
  }));
}
