// types/complaint.ts

// Mapa de votos por usuario
export type VoteMap = {
  [userId: string]: "positive" | "negative"
}

// Estructura de votos de un reclamo
export type ComplaintVotes = {
  positive: number
  negative: number
  userVotes: VoteMap
}

// Tipo principal de Complaint
export type Complaint = {
  id: string
  title: string
  entity: string
  category: string
  subcategory: string
  description: string
  location: string | null
  imageUrl: string | null
  status: "open" | "closed"
  createdAt: string
  updatedAt: string
  authorId: string       // Id del autor
  authorName: string     // Nombre del autor, para mostrar en el frontend
  votes: ComplaintVotes
  userVotes?: {
    userId: string
    type: "positive" | "negative"
  }[]
}
