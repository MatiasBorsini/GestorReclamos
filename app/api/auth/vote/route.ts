import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { userId, complaintId, type } = await req.json()

    if (!userId || !complaintId || !type) {
      return NextResponse.json(
        { error: "Faltan parámetros (userId, complaintId o type)" },
        { status: 400 }
      )
    }

    // Chequear si ya existe el voto del usuario en ese reclamo
    const existingVote = await prisma.vote.findFirst({
      where: { userId, complaintId },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: "El usuario ya votó este reclamo" },
        { status: 400 }
      )
    }

    const vote = await prisma.vote.create({
      data: {
        userId,
        complaintId,
        type, // 👈 ahora sí
      },
    })

    return NextResponse.json(vote, { status: 201 })
  } catch (error) {
    console.error("Error al registrar voto:", error)
    return NextResponse.json(
      { error: "No se pudo registrar el voto" },
      { status: 500 }
    )
  }
}
