"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { ComplaintCard } from "@/components/complaints/complaint-card"
import { Plus, FileText } from "lucide-react"
import type { Complaint } from "@/types/complaint"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function MyComplaintsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar reclamos del usuario
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const loadComplaints = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/auth/complaints?userId=${user.id}`)
        if (!res.ok) throw new Error("Error al cargar reclamos")
        const data: Complaint[] = await res.json()
        setComplaints(data)
      } catch (error) {
        console.error("Error al cargar reclamos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar tus reclamos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadComplaints()
  }, [user, router, toast])

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Manejar edición
  const handleEdit = (complaint: Complaint) => {
    router.push(`/complaints/edit/${complaint.id}`)
  }

  // Manejar eliminación
  const handleDelete = async (complaintId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este reclamo?")) return
    try {
      const res = await fetch(`/api/auth/complaints/${complaintId}`, {
        method: "DELETE",
        headers: { "x-user-id": user.id },
      })
      if (!res.ok) throw new Error("No se pudo borrar el reclamo")

      setComplaints((prev) => prev.filter((c) => c.id !== complaintId))
      toast({
        title: "Reclamo eliminado",
        description: "El reclamo ha sido eliminado exitosamente.",
      })
    } catch (error) {
      console.log("👤 user desde AuthContext:", user)
      console.error("Error al borrar reclamo:", error)
     

      toast({
        title: "Error",
        description: "No se pudo eliminar el reclamo.",
        variant: "destructive",
      })
    }
  }

  // Manejar voto
  const handleVote = async (complaintId: string, voteType: "positive" | "negative") => {
    if (!user) return
    try {
      const res = await fetch("/api/complaints/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, complaintId, type: voteType }),
      })
      if (!res.ok) throw new Error("Error al registrar el voto")
      const updatedVote = await res.json()

      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id === complaintId) {
            const currentVote = c.votes.userVotes[user.id] || null
            const newUserVotes = { ...c.votes.userVotes }

            if (currentVote === voteType) {
              delete newUserVotes[user.id]
              return {
                ...c,
                votes: {
                  positive: voteType === "positive" ? c.votes.positive - 1 : c.votes.positive,
                  negative: voteType === "negative" ? c.votes.negative - 1 : c.votes.negative,
                  userVotes: newUserVotes,
                },
              }
            } else {
              if (currentVote === "positive") c.votes.positive -= 1
              if (currentVote === "negative") c.votes.negative -= 1
              newUserVotes[user.id] = voteType
              return {
                ...c,
                votes: {
                  positive: voteType === "positive" ? c.votes.positive + 1 : c.votes.positive,
                  negative: voteType === "negative" ? c.votes.negative + 1 : c.votes.negative,
                  userVotes: newUserVotes,
                },
              }
            }
          }
          return c
        })
      )
    } catch (error) {
      console.error("Error al votar:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar tu voto",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Reclamos</h1>
              <p className="text-gray-600 mt-1">Gestiona todos tus reclamos creados</p>
            </div>
            <Link href="/complaints/new">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-5 w-5" />
                Crear Nuevo Reclamo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-600">Total</h3>
              <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-600">Abiertos</h3>
              <p className="text-2xl font-bold text-green-600">
                {complaints.filter((c) => c.status === "open").length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-600">Cerrados</h3>
              <p className="text-2xl font-bold text-gray-600">
                {complaints.filter((c) => c.status === "closed").length}
              </p>
            </div>
          </div>

          {/* Complaints Grid */}
          {complaints.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {complaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  showActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onVote={handleVote}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reclamos aún</h3>
              <p className="text-gray-500 mb-6">
                Crea tu primer reclamo para comenzar a gestionar tus solicitudes.
              </p>
              <Link href="/complaints/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Reclamo
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
