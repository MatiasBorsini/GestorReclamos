import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT: actualizar FAQ
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { question, answer, category, isActive } = body;

    const updated = await prisma.fAQ.update({
      where: { id },
      data: { question, answer, category, isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al actualizar FAQ:", error);
    return NextResponse.json({ error: "No se pudo actualizar la FAQ" }, { status: 500 });
  }
}

// DELETE: eliminar FAQ
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.fAQ.delete({ where: { id } });
    return NextResponse.json({ message: "FAQ eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar FAQ:", error);
    return NextResponse.json({ error: "No se pudo eliminar la FAQ" }, { status: 500 });
  }
}

// PATCH: alternar estado activo/inactivo
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const faq = await prisma.fAQ.findUnique({ where: { id } });

    if (!faq) {
      return NextResponse.json({ error: "FAQ no encontrada" }, { status: 404 });
    }

    const updated = await prisma.fAQ.update({
      where: { id },
      data: { isActive: !faq.isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al cambiar estado de FAQ:", error);
    return NextResponse.json({ error: "No se pudo cambiar el estado" }, { status: 500 });
  }
}
