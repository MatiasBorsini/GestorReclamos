import type { Complaint } from "@/types/complaint"

// Obtener todos los reclamos desde la base de datos
export const getStoredComplaints = async (): Promise<Complaint[]> => {
  const res = await fetch("/api/auth/complaints")
  if (!res.ok) throw new Error("Error al obtener reclamos")
  return await res.json()
}

// Guardar un nuevo reclamo en la base de datos
export const saveComplaint = async (
  complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt">
): Promise<Complaint> => {
  console.log("Imagen enviada:", complaint.imageUrl)

  const res = await fetch("/api/auth/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(complaint),
  })

  const data = await res.json()
  console.log("Respuesta del backend:", res.status, data)

  if (!res.ok) throw new Error("Error al guardar el reclamo")
  return data
}

// Actualizar un reclamo existente
export const updateComplaint = async (complaintId: string, updates: Partial<Complaint>): Promise<Complaint> => {
  const res = await fetch(`/api/auth/complaints/${complaintId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error("Error al actualizar el reclamo")
  return await res.json()
}

// Borrar un reclamo
export const deleteComplaint = async (complaintId: string): Promise<void> => {
  const res = await fetch(`/api/auth/complaints/${complaintId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Error al borrar el reclamo")
}
