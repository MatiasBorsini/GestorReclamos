// app/api/complaints/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Crear un nuevo complaint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Datos recibidos:", body);

    const {
      title,
      description,
      category,
      subcategory,
      imageUrl,
      location,
      authorId,
      entityId,
    } = body;

    if (!title || !description || !category || !subcategory || !authorId || !entityId) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        subcategory,
        imageUrl,
        location,
        authorId,
        entityId,
      },
      include: { author: true, entidad: true, userVotes: true },
    });

    // Construir votos con validación de tipos
    const userVotesMap: { [key: string]: "positive" | "negative" } = {};
    complaint.userVotes.forEach((v) => {
      if (v.type === "positive" || v.type === "negative") {
        userVotesMap[v.userId] = v.type;
      }
    });

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
    console.error("Error al guardar el reclamo:", error);
    return NextResponse.json({ error: "Error al guardar el reclamo" }, { status: 500 });
  }
}

// GET: Obtener todos los complaints (opcional por userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const complaints = await prisma.complaint.findMany({
      where: userId ? { authorId: userId } : {},
      include: {
        author: true,
        entidad: true,
        userVotes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const transformed = complaints.map((c) => {
      const userVotesMap: { [key: string]: "positive" | "negative" } = {};
      c.userVotes.forEach((v) => {
        if (v.type === "positive" || v.type === "negative") {
          userVotesMap[v.userId] = v.type;
        }
      });

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        subcategory: c.subcategory,
        imageUrl: c.imageUrl ?? undefined,
        location: c.location ?? "",
        authorId: c.authorId,
        authorName: c.author.name,
        entity: c.entidad?.nombre ?? "",
        status: c.status as "open" | "closed",
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        votes: {
          positive: Object.values(userVotesMap).filter((v) => v === "positive").length,
          negative: Object.values(userVotesMap).filter((v) => v === "negative").length,
          userVotes: userVotesMap,
        },
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error al obtener reclamos:", error);
    return NextResponse.json({ error: "No se pudieron cargar los reclamos" }, { status: 500 });
  }
}

// PATCH: Actualizar el estado de un complaint
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { complaintId, status } = body;

    if (!complaintId || !status) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
      include: { author: true, entidad: true, userVotes: true },
    });

    const userVotesMap: { [key: string]: "positive" | "negative" } = {};
    updated.userVotes.forEach((v) => {
      if (v.type === "positive" || v.type === "negative") {
        userVotesMap[v.userId] = v.type;
      }
    });

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
    console.error("Error al actualizar el estado:", error);
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }
}
