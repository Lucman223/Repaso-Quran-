import type { Segmento } from "./segmentos";

// Clave de traspaso entre la pantalla de selección y el reproductor. Se usa
// sessionStorage porque una lista de segmentos con rangos de aleyas no cabe
// cómodamente en la URL.
export const REPASO_LIBRE_KEY = "repaso-libre-sesion";

export interface RepasoLibreConfig {
  segmentos: Segmento[];
  reps: number;
  mode: "seq" | "page";
}
