import {
  fetchPageVerses,
  juzOfAbsolutePage,
  type Verse,
} from "./quran";

// Unidad mínima de repaso flexible. Una lista de repaso es un array de estos.
//
//  - "pagina": una página entera del Mushaf, identificada por su (juz, vuelta).
//    De ahí se deriva la página absoluta para el audio y la imagen a mostrar.
//
//  - "rango": un tramo de aleyas que puede empezar en una página y terminar en
//    otra (p. ej. media página, o de la mitad de una a la mitad de la siguiente).
//    Se identifica por la aleya inicial y final en formato "sura:aleya".
export type Segmento =
  | { tipo: "pagina"; juz: number; vuelta: number }
  | { tipo: "rango"; desde: string; hasta: string }
  | { tipo: "absoluta"; pagina: number };

// Comparación de claves de aleya "sura:aleya": ordena primero por sura y luego
// por número de aleya, de modo que "2:7" < "2:15" < "3:1".
function compareVerseKey(a: string, b: string): number {
  const [sa, aa] = a.split(":").map(Number);
  const [sb, ab] = b.split(":").map(Number);
  return sa !== sb ? sa - sb : aa - ab;
}

export interface SegmentoResuelto {
  // Aleyas a reproducir, en orden.
  verses: Verse[];
  // Páginas absolutas que cubre el segmento (1+ imágenes a mostrar).
  pages: number[];
  // Juz al que pertenece (el de la primera página), para etiquetas de UI.
  juz: number;
}

// Trae las aleyas de un rango de páginas absolutas [from, to] (inclusive),
// reutilizando fetchPageVerses (que ya cachea por página en el store).
async function versesForPageRange(from: number, to: number): Promise<Verse[]> {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const all: Verse[] = [];
  for (let p = lo; p <= hi; p++) {
    const verses = await fetchPageVerses(p);
    all.push(...verses);
  }
  return all;
}

// Encuentra en qué página absoluta vive una aleya concreta. Recorre páginas
// desde un punto de partida razonable hasta dar con la que la contiene.
// Devuelve null si no se encuentra (aleya inexistente o fuera de rango).
async function findPageOfVerse(
  verseKey: string,
  searchFrom = 1,
  searchTo = 604
): Promise<{ page: number; verses: Verse[] } | null> {
  for (let p = searchFrom; p <= searchTo; p++) {
    const verses = await fetchPageVerses(p);
    if (verses.some((v) => v.verse_key === verseKey)) {
      return { page: p, verses };
    }
  }
  return null;
}

// Resuelve un segmento a las aleyas y páginas concretas que hay que reproducir
// y mostrar. Lanza si el rango es inválido (aleyas no encontradas).
export async function resolverSegmento(
  seg: Segmento,
  ctx?: { absolutePageOf: (juz: number, vuelta: number) => number }
): Promise<SegmentoResuelto> {
  if (seg.tipo === "pagina") {
    if (!ctx) throw new Error("Falta contexto para resolver página");
    const absolutePage = ctx.absolutePageOf(seg.juz, seg.vuelta);
    const verses = await fetchPageVerses(absolutePage);
    return { verses, pages: [absolutePage], juz: seg.juz };
  }

  if (seg.tipo === "absoluta") {
    const verses = await fetchPageVerses(seg.pagina);
    return { verses, pages: [seg.pagina], juz: juzOfAbsolutePage(seg.pagina) };
  }

  // Rango de aleyas: localizar la página de inicio y la de fin, traer todas las
  // aleyas del tramo de páginas y recortar a [desde, hasta].
  const start = await findPageOfVerse(seg.desde);
  if (!start) throw new Error(`Aleya inicial no encontrada: ${seg.desde}`);
  const end = await findPageOfVerse(seg.hasta, start.page);
  if (!end) throw new Error(`Aleya final no encontrada: ${seg.hasta}`);

  const pageLo = Math.min(start.page, end.page);
  const pageHi = Math.max(start.page, end.page);
  const allVerses = await versesForPageRange(pageLo, pageHi);

  const lo = compareVerseKey(seg.desde, seg.hasta) <= 0 ? seg.desde : seg.hasta;
  const hi = compareVerseKey(seg.desde, seg.hasta) <= 0 ? seg.hasta : seg.desde;
  const verses = allVerses.filter(
    (v) =>
      compareVerseKey(v.verse_key, lo) >= 0 &&
      compareVerseKey(v.verse_key, hi) <= 0
  );

  const pages = Array.from(
    { length: pageHi - pageLo + 1 },
    (_, i) => pageLo + i
  );
  return { verses, pages, juz: juzOfAbsolutePage(pageLo) };
}

// Etiqueta corta para mostrar un segmento en chips/listas sin tener que
// resolverlo (no requiere red).
export function labelSegmento(seg: Segmento): string {
  if (seg.tipo === "pagina") return `J${seg.juz} · V${seg.vuelta}`;
  if (seg.tipo === "absoluta") return `Pág. ${seg.pagina}`;
  return `${seg.desde}–${seg.hasta}`;
}
