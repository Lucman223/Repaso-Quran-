export function getRecommendedPagesToReview(
  pageStudyHistory: Record<number, string[]>
): number[] {
  const recommendations = new Set<number>();
  const today = new Date().toISOString().split('T')[0];

  // Ordenar todas las páginas estudiadas por la fecha en que se estudiaron por primera vez
  const pages = Object.keys(pageStudyHistory).map(Number);
  const pageFirstDates = pages.map(p => ({
    page: p,
    firstDate: pageStudyHistory[p][0],
    daysStudied: pageStudyHistory[p].length,
    dates: pageStudyHistory[p]
  })).sort((a, b) => a.firstDate.localeCompare(b.firstDate));

  // 1. "revisar una pagina durante 2 dias"
  // Si la última página empezada solo tiene 1 día, la recomendamos para hoy (su 2do día)
  if (pageFirstDates.length > 0) {
    const lastPage = pageFirstDates[pageFirstDates.length - 1];
    if (lastPage.daysStudied === 1 && !lastPage.dates.includes(today)) {
      recommendations.add(lastPage.page);
    }
  }

  // 2. "el sel sexto dia repasar las 3 paginas a la vez"
  // Agrupamos en bloques de 3
  for (let i = 0; i < pageFirstDates.length; i += 3) {
    const chunkOf3 = pageFirstDates.slice(i, i + 3);
    if (chunkOf3.length === 3) {
      // Si el bloque de 3 acaba de completar sus 2 días cada uno recientemente
      // y no se ha hecho un repaso conjunto (podemos estimar si las 3 tienen una fecha en común después de que la 3ra completó su 2do día)
      const lastPageInChunk = chunkOf3[2];
      if (lastPageInChunk.daysStudied >= 2) {
        const lastStudyDateOf3rdPage = lastPageInChunk.dates[1]; // Su 2do día
        // Si el 2do día de la 3ra página fue ayer o hace poco, y las otras no tienen repaso, las recomendamos.
        // Simplificación: si la 3ra página ya tiene 2 días, verificamos si las 3 tienen una fecha de repaso en común (día 3 para la 1ra, etc)
        const allHaveCommonReviewDay = chunkOf3.every(p => p.daysStudied >= 3);
        if (!allHaveCommonReviewDay && (lastPageInChunk.dates.includes(today) || lastPageInChunk.dates.length >= 2)) {
          // Recomendar las 3
          chunkOf3.forEach(p => recommendations.add(p.page));
        }
      }
    }
  }

  // 3. "cada 10 paginas leerlas todo de una vez"
  for (let i = 0; i < pageFirstDates.length; i += 10) {
    const chunkOf10 = pageFirstDates.slice(i, i + 10);
    if (chunkOf10.length === 10) {
      const lastPage = chunkOf10[9];
      if (lastPage.daysStudied >= 2) {
        // ¿Ya se repasaron las 10 juntas? (podemos ver si la 1ra página tiene como 4 o 5 repasos)
        const allHaveCommon10Review = chunkOf10.every(p => p.daysStudied >= 4);
        if (!allHaveCommon10Review) {
          chunkOf10.forEach(p => recommendations.add(p.page));
        }
      }
    }
  }

  // 4. "cuando se complete una vuelta entera 30 paginas"
  for (let i = 0; i < pageFirstDates.length; i += 30) {
    const chunkOf30 = pageFirstDates.slice(i, i + 30);
    if (chunkOf30.length === 30) {
      const lastPage = chunkOf30[29];
      if (lastPage.daysStudied >= 2) {
        const allHaveCommon30Review = chunkOf30.every(p => p.daysStudied >= 5);
        if (!allHaveCommon30Review) {
          chunkOf30.forEach(p => recommendations.add(p.page));
        }
      }
    }
  }

  return Array.from(recommendations);
}
