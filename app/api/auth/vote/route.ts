import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, complaintId, type } = await req.json();

    if (!userId || !complaintId) {
      return NextResponse.json(
        { error: "Faltan parámetros (userId o complaintId)" },
        { status: 400 }
      );
    }

    // Buscar voto existente
    const existingVote = await prisma.vote.findFirst({
      where: { userId, complaintId },
    });

    if (existingVote) {
      if (!type) {
        // Desmarcar voto
        await prisma.vote.delete({ where: { id: existingVote.id } });
        return NextResponse.json({ success: true, action: "deleted" });
      } else {
        // Cambiar tipo de voto
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        return NextResponse.json({ success: true, action: "updated" });
      }
    }

    if (!type) {
      // No existe voto y no se envía tipo → no hacer nada
      return NextResponse.json({ success: false, message: "No hay tipo de voto" });
    }

    // Crear nuevo voto
    const vote = await prisma.vote.create({
      data: { userId, complaintId, type },
    });

    return NextResponse.json({ success: true, vote });
  } catch (error) {
    console.error("Error al registrar voto:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el voto" },
      { status: 500 }
    );
  }
}
