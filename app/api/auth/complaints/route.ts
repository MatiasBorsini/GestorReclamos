import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Datos recibidos:", body)


    const {
      title,
      description,
      category,
      subcategory,
      imageUrl,
      location,
      authorId,
    } = body

    if (!title || !description || !category || !subcategory || !authorId) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
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
      },
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error("Error al guardar el reclamo:", error)
    return NextResponse.json({ error: "Error al guardar el reclamo" }, { status: 500 })
  }
}

// app/api/complaints/route.ts

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Falta el userId" },
        { status: 400 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      where: { authorId: userId },
      include: {
        author: true,
        userVotes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 🔄 Transformamos los datos
    const transformed = complaints.map((c) => {
      const positive = c.userVotes.filter((v) => v.type === "positive").length;
      const negative = c.userVotes.filter((v) => v.type === "negative").length;

      const userVotesMap: { [key: string]: "positive" | "negative" } = {};
      c.userVotes.forEach((v) => {
        userVotesMap[v.userId] = v.type as "positive" | "negative";
      });

      return {
        id: c.id,
        title: c.title,
        entity: "", // ⚠️ si en tu schema Complaint no está relacionado con Entidad, déjalo vacío
        category: c.category,
        subcategory: c.subcategory,
        description: c.description,
        location: c.location ?? "",
        imageUrl: c.imageUrl ?? undefined,
        authorId: c.authorId,
        authorName: c.author.name,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        status: c.status as "open" | "closed",
        votes: {
          positive,
          negative,
          userVotes: userVotesMap,
        },
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error al obtener reclamos del usuario:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los reclamos" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { complaintId, status } = body

    if (!complaintId || !status) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error al actualizar el estado:", error)
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 })
  }
}

