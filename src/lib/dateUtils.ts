/**
 * Utilidades para fechas de estudio.
 * 
 * Por defecto, en la app el "día" se reinicia a las 6:00 AM.
 * Todo el estudio realizado entre las 00:00 y las 05:59 se computará
 * como perteneciente al día anterior.
 */
export function getTodayDateString(date = new Date()): string {
  // Restamos 6 horas a la fecha actual.
  // Si son las 05:00 AM del 20 de Agosto, ajustado será 23:00 del 19 de Agosto.
  const adjusted = new Date(date.getTime() - 6 * 60 * 60 * 1000);
  
  // Extraemos YYYY-MM-DD ajustado a la zona horaria local del usuario.
  const tzOffset = adjusted.getTimezoneOffset() * 60000;
  const localDate = new Date(adjusted.getTime() - tzOffset);
  
  return localDate.toISOString().split("T")[0];
}
