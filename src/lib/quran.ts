export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
}

export type Reciter = 'krh' | 'husary' | 'minshawi' | 'maher';

export const RECITERS = {
  krh: { nameAr: 'ك. ر. هـ', nameEs: 'K.R.H.' },
  husary: { nameAr: 'محمود خليل الحصري', nameEs: 'Al-Husary' },
  minshawi: { nameAr: 'محمد صديق المنشاوي', nameEs: 'Minshawi (Mujawwad)' },
  maher: { nameAr: 'ماهر المعيقلي', nameEs: 'Maher Al-Muaiqly' },
} as const satisfies Record<Reciter, { nameAr: string; nameEs: string }>;

export const JUZ_STARTING_PAGES = [
  2, 22, 42, 62, 82, 102, 122, 142, 162, 182,
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export const AVAILABLE_VUELTAS = Array.from({ length: 20 }, (_, i) => i + 1);

// Número de páginas por juz en el Mushaf de Medina (~20 cada uno).
export const PAGES_PER_JUZ = 20;
// Total de páginas del Mushaf estándar (la última es la 604).
export const TOTAL_MUSHAF_PAGES = 604;

// El método de vueltas recorre una página fija de cada juz: la vuelta V
// corresponde a la página (21 - V) dentro del juz (vuelta 1 → página 20,
// la última; vuelta 2 → página 19; etc.). De ahí se derivan tres cosas:
//   - pageId: índice 1..20 de la página dentro del juz.
//   - localPageNumber: identificador del archivo de imagen P{n}.png dentro
//     de la carpeta {vuelta}V (20, 40, 60… para la vuelta 1).
//   - absolutePage: página real del Mushaf (1..604), usada para el audio.
export function vueltaToPageId(vuelta: number): number {
  return 21 - vuelta;
}

export function localPageNumber(juz: number, vuelta: number): number {
  return (juz - 1) * PAGES_PER_JUZ + vueltaToPageId(vuelta);
}

export function absolutePageOf(juz: number, vuelta: number): number {
  return (JUZ_STARTING_PAGES[juz - 1] ?? 1) + vueltaToPageId(vuelta) - 1;
}

// Inverso: dada una página absoluta del Mushaf, devuelve a qué juz pertenece
// (1..30). Busca el último juz cuya página de inicio no supera la página dada.
export function juzOfAbsolutePage(absolutePage: number): number {
  let juz = 1;
  for (let i = 0; i < JUZ_STARTING_PAGES.length; i++) {
    if (absolutePage >= JUZ_STARTING_PAGES[i]) juz = i + 1;
    else break;
  }
  return juz;
}

// Inversa de absolutePageOf: dada una página absoluta del Mushaf, calcula a
// qué combinación (juz, vuelta) del método de vueltas pertenece.
export function vueltaJuzOfAbsolutePage(absolutePage: number): { vuelta: number; juz: number } {
  // Fix for Page 1 (Al-Fatiha): Treat it as part of Juz 1, Page 2 for the Ottoman method calculations
  // to prevent it from generating an invalid Vuelta 21
  const effectivePage = absolutePage < 2 ? 2 : absolutePage;
  const juz = juzOfAbsolutePage(effectivePage);
  const juzStart = JUZ_STARTING_PAGES[juz - 1] ?? 1;
  const pageId = effectivePage - juzStart + 1; // 1 to 20
  const vuelta = 21 - pageId;
  return { vuelta, juz };
}

// Ruta de la imagen del Mushaf para una página de una vuelta. El contenido se
// sube por vuelta: /Coran/{vuelta}V/P{localPageNumber}.png. Puede no existir
// todavía (el reproductor muestra un placeholder en ese caso).
export function pageImageUrl(juz: number, vuelta: number): string {
  return `/Coran/${vuelta}V/P${localPageNumber(juz, vuelta)}.png?v=2`;
}

export function getAyahAudioUrl(
  verseKey: string, 
  reciter: Reciter = 'minshawi', 
  vueltaId?: string | number
): string {
  // verseKey viene como "1:1" -> necesitamos "001001"
  const [sura, ayah] = verseKey.split(':');
  const suraPad = sura.padStart(3, '0');
  const ayahPad = ayah.padStart(3, '0');
  const file = `${suraPad}${ayahPad}`;

  if (reciter === 'krh') {
    // Si no se provee vueltaId, por defecto asumimos Vuelta 1
    const v = vueltaId ?? 1;
    return `/Coran/${v}V/KRH/Audios/${file}.mp3`;
  }
  if (reciter === 'husary') {
    return `https://everyayah.com/data/Husary_128kbps/${file}.mp3`;
  }
  if (reciter === 'maher') {
    return `https://everyayah.com/data/MaherAlMuaiqly128kbps/${file}.mp3`;
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
