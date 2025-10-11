// app/api/auth/complaints/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type VoteType = "positive" | "negative";

// Función auxiliar para mapear votos
function mapVotes(userVotes: { type: string; userId: string }[]) {
  const userVotesMap: { [key: string]: VoteType } = {};
  userVotes.forEach((v) => {
    if (v.type === "positive" || v.type === "negative") {
      userVotesMap[v.userId] = v.type;
    }
  });
  return userVotesMap;
}

// GET: Obtener un reclamo por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const cleanId = rawId?.trim().replace(/\r?\n|\r/g, "");

    const complaint = await prisma.complaint.findUnique({
      where: { id: cleanId },
      include: { author: true, entidad: true, userVotes: true },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Reclamo no encontrado" }, { status: 404 });
    }

    const userVotesMap = mapVotes(complaint.userVotes);

    return NextResponse.json({
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      subcategory: complaint.subcategory,
      imageUrl: complaint.imageUrl ?? undefined,
      location: complaint.location ?? "",
      authorId: complaint.authorId,
      authorName: complaint.author.name,
      entity: complaint.entidad?.nombre ?? "",
      status: complaint.status as "open" | "closed",
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      votes: {
        positive: Object.values(userVotesMap).filter((v) => v === "positive").length,
        negative: Object.values(userVotesMap).filter((v) => v === "negative").length,
        userVotes: userVotesMap,
      },
    });
  } catch (error) {
    console.error("Error al obtener reclamo:", error);
    return NextResponse.json({ error: "Error al obtener reclamo" }, { status: 500 });
  }
}

// PUT: Actualizar un reclamo por ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const cleanId = rawId?.trim().replace(/\r?\n|\r/g, "");
    const updates = await request.json();
    const userId = updates.authorId;

    const existing = await prisma.complaint.findUnique({
      where: { id: cleanId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Reclamo no encontrado" }, { status: 404 });
    }

    if (existing.authorId !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const updated = await prisma.complaint.update({
      where: { id: cleanId },
      data: {
        title: updates.title,
        description: updates.description,
        location: updates.location,
        category: updates.category,
        subcategory: updates.subcategory,
        authorId: updates.authorId,
        entityId: updates.entityId ? Number(updates.entityId) : existing.entityId,
        imageUrl: updates.imageUrl ?? null,
      },
      include: { author: true, entidad: true, userVotes: true },
    });

    const userVotesMap = mapVotes(updated.userVotes);

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      category: updated.category,
      subcategory: updated.subcategory,
      imageUrl: updated.imageUrl ?? undefined,
      location: updated.location ?? "",
      authorId: updated.authorId,
      authorName: updated.author.name,
      entity: updated.entidad?.nombre ?? "",
      status: updated.status as "open" | "closed",
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      votes: {
        positive: Object.values(userVotesMap).filter((v) => v === "positive").length,
        negative: Object.values(userVotesMap).filter((v) => v === "negative").length,
        userVotes: userVotesMap,
      },
    });
  } catch (error) {
    console.error("Error al actualizar reclamo:", error);
    return NextResponse.json({ error: "Error al actualizar reclamo" }, { status: 500 });
  }
}

// DELETE: Eliminar un reclamo por ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const cleanId = rawId?.trim().replace(/\r?\n|\r/g, "");
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const existing = await prisma.complaint.findUnique({
      where: { id: cleanId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Reclamo no encontrado" }, { status: 404 });
    }

    if (existing.authorId !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // 1️⃣ Borrar primero todos los votos asociados
    await prisma.vote.deleteMany({
      where: { complaintId: cleanId },
    });

    // 2️⃣ Luego borrar el reclamo
    await prisma.complaint.delete({
      where: { id: cleanId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar reclamo:", error);
    return NextResponse.json({ error: "Error al eliminar reclamo" }, { status: 500 });
  }
}
