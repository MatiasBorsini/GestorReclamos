// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const entityName = req.nextUrl.searchParams.get("entity");
  if (!entityName) return NextResponse.json({ error: "Falta entity" }, { status: 400 });

  try {
    const entity = await prisma.entidad.findUnique({
      where: { nombre: entityName },
      include: { categorias: true },
    });

    if (!entity) return NextResponse.json({ error: "Entidad no encontrada" }, { status: 404 });

    const categories = entity.categorias.map((c) => ({ id: c.id, nombre: c.nombre }));
    return NextResponse.json(categories);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
