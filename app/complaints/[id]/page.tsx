"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, MapPin, Calendar, ArrowLeft, Edit, Trash2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Complaint } from "@/types/complaint"
import Link from "next/link"
import { ComplaintMapNoAPI } from "@/components/maps/ComplaintMapNoAPI"

export default function ComplaintDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()
  const id = params?.id as string

  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [userVote, setUserVote] = useState<"positive" | "negative" | null>(null)
  const [loading, setLoading] = useState(true)

  // Traer reclamo por ID
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchComplaint = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/auth/complaints/${id}`)
        if (!res.ok) throw new Error("Error al cargar reclamo")
        const data = await res.json()

        const mappedComplaint: Complaint = {
          id: data.id,
          title: data.title,
          entity: data.entity ?? "Desconocida",
          category: data.category,
          subcategory: data.subcategory,
          description: data.description,
          location: data.location ?? null,
          imageUrl: data.imageUrl ?? null,
          status: data.status === "open" ? "open" : "closed",
          createdAt: new Date(data.createdAt).toISOString(),
          updatedAt: new Date(data.updatedAt).toISOString(),
          authorId: data.authorId,
          authorName: data.authorName ?? "Desconocido",
          votes: data.votes,
        }

        setComplaint(mappedComplaint)
        setUserVote(mappedComplaint.votes.userVotes[user.id] ?? null)
      } catch (err) {
        console.error(err)
        toast({ title: "Error al cargar reclamo", variant: "destructive" })
        router.push("/complaints/my")
      } finally {
        setLoading(false)
      }
    }

    fetchComplaint()
  }, [id, user, router, toast])

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!complaint) return null

  const isOwnComplaint = user.id === complaint.authorId
  const canVote = !isOwnComplaint

  // Manejar votos
  const handleVote = async (voteType: "positive" | "negative") => {
    if (!user || !complaint) return

    const currentVote = complaint.votes.userVotes[user.id] ?? null
    const newVote = currentVote === voteType ? null : voteType

    try {
      const res = await fetch("/api/auth/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          complaintId: complaint.id,
          type: newVote,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        console.error("Error al registrar el voto:", data)
        return
      }

      const updatedUserVotes = { ...complaint.votes.userVotes }
      if (currentVote) delete updatedUserVotes[user.id]
      if (newVote) updatedUserVotes[user.id] = newVote

      setComplaint({
        ...complaint,
        votes: {
          userVotes: updatedUserVotes,
          positive: Object.values(updatedUserVotes).filter(v => v === "positive").length,
          negative: Object.values(updatedUserVotes).filter(v => v === "negative").length,
        },
      })
      setUserVote(newVote)
    } catch (err) {
      console.error("Error al votar:", err)
    }
  }

  // Manejar eliminación
  const handleDelete = async () => {
    if (!complaint) return
    if (confirm("¿Estás seguro de que quieres eliminar este reclamo?")) {
      try {
        const res = await fetch(`/api/auth/complaints/${complaint.id}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Error al eliminar")
        toast({
          title: "Reclamo eliminado",
          description: "El reclamo ha sido eliminado exitosamente.",
        })
        router.push("/complaints/my")
      } catch (err) {
        console.error(err)
        toast({ title: "Error al eliminar", variant: "destructive" })
      }
    }
  }

  const getStatusColor = (status: "open" | "closed") =>
    status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{complaint.entity}</Badge>
                  <Badge variant="secondary">{complaint.category}</Badge>
                  <Badge variant="outline" className="text-xs">{complaint.subcategory}</Badge>
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status === "open" ? "Abierto" : "Cerrado"}
                  </Badge>
                </div>
              </div>

              {isOwnComplaint && (
                <div className="flex gap-2">
                  <Link href={`/complaints/edit/${complaint.id}`}>
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{complaint.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{complaint.authorName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Creado el {new Date(complaint.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Descripción</h3>
                      <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
                    </div>

                    {complaint.location && (
                      <ComplaintMapNoAPI
                        location={complaint.location}
                        userRole={user.role}
                        complaintTitle={complaint.title}
                        className="mt-4"
                      />
                    )}

                    {complaint.imageUrl && (
                      <div>
                        <h3 className="font-semibold mb-2">Imagen</h3>
                        <img
                          src={complaint.imageUrl}
                          alt="Foto del reclamo"
                          className="w-full max-w-md h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Votos</h3>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Button
                    variant={userVote === "positive" ? "default" : "outline"}
                    onClick={() => handleVote("positive")}
                    disabled={!canVote}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    {complaint.votes.positive}
                  </Button>
                  <Button
                    variant={userVote === "negative" ? "default" : "outline"}
                    onClick={() => handleVote("negative")}
                    disabled={!canVote}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    {complaint.votes.negative}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
