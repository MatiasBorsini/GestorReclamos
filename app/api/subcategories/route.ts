// app/api/subcategories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const entityName = req.nextUrl.searchParams.get("entity");
  const categoryName = req.nextUrl.searchParams.get("category");
  if (!entityName || !categoryName)
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });

  try {
    const categoria = await prisma.categoria.findFirst({
      where: {
        nombre: categoryName,
        entidad: { nombre: entityName },
      },
      include: { subcategorias: true },
    });

    if (!categoria) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

    const subcategories = categoria.subcategorias.map((s) => ({ id: s.id, nombre: s.nombre }));
    return NextResponse.json(subcategories);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
