// app/api/entities/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET() {
  try {
    const entities = await prisma.entidad.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(entities);
  } catch (err) {
    console.error("Error al obtener entidades:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
