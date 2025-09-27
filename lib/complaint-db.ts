import { PrismaClient } from "@prisma/client"
import type { Complaint } from "@/types/complaint"

const prisma = new PrismaClient()

type RawVote = { userId: string; type: string }

export async function getComplaintById(id: string): Promise<Complaint | null> {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      author: true,     // relación con User
      userVotes: true,  // votos
      entidad: true,    // relación con Entidad
    },
  })

  if (!complaint) return null

return {
  id: complaint.id,
  title: complaint.title,
  entity: complaint.entidad?.nombre ?? "Desconocida",
  category: complaint.category,
  subcategory: complaint.subcategory,
  description: complaint.description,
  location: complaint.location ?? null,
  imageUrl: complaint.imageUrl ?? null,
  status: complaint.status === "open" ? "open" : "closed",
  createdAt: complaint.createdAt.toISOString(),
  updatedAt: complaint.updatedAt.toISOString(),
  authorId: complaint.authorId,
  authorName: complaint.author?.name ?? "Desconocido",
  votes: {
    positive: complaint.userVotes.filter(v => v.type === "positive").length,
    negative: complaint.userVotes.filter(v => v.type === "negative").length,
    userVotes: Object.fromEntries(
      complaint.userVotes.map(v => [v.userId, v.type as "positive" | "negative"])
    ),
  },
  userVotes: complaint.userVotes.map(v => ({
    userId: v.userId,
    type: v.type as "positive" | "negative",
  })),
}
}


export const getEntities = async (): Promise<string[]> => {
  const entities = await prisma.entidad.findMany({
    select: { nombre: true },
  })
  return entities.map(e => e.nombre)
}

export const getCategories = async (entityName: string): Promise<string[]> => {
  if (!entityName) return []
  const entity = await prisma.entidad.findUnique({
    where: { nombre: entityName },
    select: { categorias: { select: { nombre: true } } },
  })
  return entity?.categorias.map(c => c.nombre) || []
}

export const getSubcategories = async (entityName: string, categoryName: string): Promise<string[]> => {
  if (!entityName || !categoryName) return []

  const category = await prisma.categoria.findFirst({
    where: {
      nombre: categoryName,
      entidad: { nombre: entityName },
    },
    select: { subcategorias: { select: { nombre: true } } },
  })

  return category?.subcategorias.map(s => s.nombre) || []
}
