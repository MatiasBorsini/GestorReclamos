// types/user.ts
import { Complaint } from "./complaint"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "client"
  createdAt: string
  updatedAt?: string
  complaints?: Complaint[]
  votes?: Vote[]
}

export interface Vote {
  id?: string
  type: "positive" | "negative"
  complaintId?: string
  userId?: string
}
