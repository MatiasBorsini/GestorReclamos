import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { title, description, category, subcategory, imageUrl, location, authorId, entityId } = await request.json()

    if (!title || !description || !category || !subcategory || !authorId || !entityId) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: authorId } })
    if (!user) {
      return NextResponse.json({ error: "Usuario no existe" }, { status: 404 })
    }
    if (!user.verificado) {
      return NextResponse.json({ error: "Cuenta no verificada" }, { status: 403 })
    }

    const complaint = await prisma.complaint.create({
      data: { title, description, category, subcategory, imageUrl, location, authorId, entityId },
      include: { author: true, entidad: true, userVotes: true },
    })

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
      votes: { positive: 0, negative: 0, userVotes: {} },
    }, { status: 201 })
  } catch (error) {
    console.error("Error al crear reclamo protegido:", error)
    return NextResponse.json({ error: "Error al crear reclamo" }, { status: 500 })
  }
}




