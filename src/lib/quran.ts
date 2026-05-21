export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
}

export type Reciter = 'husary' | 'minshawi';

export const RECITERS = {
  husary: { nameAr: 'الحصري', nameEs: 'Al-Husary' },
  minshawi: { nameAr: 'المنشاوي', nameEs: 'Al-Minshawi' },
} as const satisfies Record<Reciter, { nameAr: string; nameEs: string }>;

export const JUZ_STARTING_PAGES = [
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export function getAyahAudioUrl(verseKey: string, reciter: Reciter): string {
  const [surah, verse] = verseKey.split(':');
  const file = `${surah.padStart(3, '0')}${verse.padStart(3, '0')}`;
  if (reciter === 'husary') {
    return `https://everyayah.com/data/Husary_128kbps/${file}.mp3`;
  }
  return `https://everyayah.com/data/Minshawi_Murattal_128kbps/${file}.mp3`;
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
