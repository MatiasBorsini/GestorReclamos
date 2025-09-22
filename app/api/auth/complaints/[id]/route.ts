import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener un reclamo por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: params.id }, // ✅ usar string directamente
    include: { author: true },
  });

  if (!complaint) {
    return NextResponse.json({ error: "Reclamo no encontrado" }, { status: 404 });
  }

  return NextResponse.json(complaint);
}

// Actualizar un reclamo por ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updates = await request.json();
  const complaint = await prisma.complaint.update({
    where: { id: params.id }, // ✅ sin Number()
    data: updates,
  });

  return NextResponse.json(complaint);
}

// Borrar un reclamo por ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.complaint.delete({
    where: { id: params.id }, // ✅ sin Number()
  });

  return NextResponse.json({ success: true });
}
