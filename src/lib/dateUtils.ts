/**
 * Utilidades para fechas de estudio.
 * 
 * Devuelve la fecha local del usuario en formato YYYY-MM-DD.
 */
export function getTodayDateString(date = new Date()): string {
  // Extraemos YYYY-MM-DD ajustado a la zona horaria local del usuario.
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  
  return localDate.toISOString().split("T")[0];
}
