// types/vote.ts
export interface Vote {
  id: string
  userId: string
  complaintId: string
  type: "positive" | "negative"
  createdAt: string
}

