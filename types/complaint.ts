
export interface Vote {
  id: string
  userId: string
  complaintId: string
  type: "positive" | "negative"
  createdAt: string
}

export interface Complaint {
  id: string
  title: string
  entity: string
  category: string
  subcategory: string
  description: string
  location?: string | null
  imageUrl?: string | null
  authorId: string
  authorName: string
  createdAt: string
  updatedAt: string
  status: "open" | "closed"

  // Relación con Prisma
  userVotes: Vote[]
}
