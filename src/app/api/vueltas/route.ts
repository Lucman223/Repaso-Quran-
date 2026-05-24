import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const coranPath = path.join(process.cwd(), "public", "Coran");
    
    if (!fs.existsSync(coranPath)) {
      return NextResponse.json([1]); // Fallback seguro
    }

    const items = await fs.promises.readdir(coranPath, { withFileTypes: true });
    
    const vueltas: number[] = [];
    
    for (const item of items) {
      if (item.isDirectory()) {
        const match = item.name.match(/^(\d+)V$/);
        if (match) {
          vueltas.push(parseInt(match[1], 10));
        }
      }
    }

    // Ordenar de menor a mayor
    vueltas.sort((a, b) => a - b);

    // Si no se encuentra ninguna carpeta, devolvemos al menos [1] como valor por defecto
    if (vueltas.length === 0) {
      vueltas.push(1);
    }

    // Permitir cachear esta respuesta brevemente o marcarla para que no sea estática pura
    return NextResponse.json(vueltas, {
      headers: {
        "Cache-Control": "public, max-age=10, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Error al leer directorios de vueltas:", error);
    return NextResponse.json([1]); // Fallback seguro
  }
}
