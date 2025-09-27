"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComplaintCard } from "@/components/complaints/complaint-card"
import { Search, Filter } from "lucide-react"
import type { Complaint } from "@/types/complaint"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [entities, setEntities] = useState<string[]>([])

  // Traer todas las entidades desde DB
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await fetch("/api/entities")
        const data = await res.json()
        setEntities(data.map((e: any) => e.nombre))
      } catch (err) {
        console.error("Error al cargar entidades:", err)
      }
    }
    fetchEntities()
  }, [])

  // Fetch todos los reclamos
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchComplaints = async () => {
      try {
        const res = await fetch("/api/auth/complaints")
        const data: Complaint[] = await res.json()
        setComplaints(data)
      } catch (error) {
        console.error("Error al cargar reclamos:", error)
      }
    }

    fetchComplaints()
  }, [user, router])

  // Aplicar filtros
  useEffect(() => {
    let filtered = complaints

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      )
    }

    if (entityFilter !== "all") {
      filtered = filtered.filter((c) => c.entity === entityFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    setFilteredComplaints(filtered)
  }, [complaints, searchTerm, entityFilter, statusFilter])

  // Manejar votos
const handleVote = async (complaintId: string, voteType: "positive" | "negative") => {
  if (!user) return;

  const complaint = complaints.find(c => c.id === complaintId);
  if (!complaint) return;

  const currentVote = complaint.votes.userVotes[user.id] ?? null;
  const newVote = currentVote === voteType ? null : voteType; // null = desmarcar

  try {
    const res = await fetch("/api/auth/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        complaintId: complaint.id,
        type: newVote,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("Error al registrar el voto:", errData);
      return; // no lanzar excepción, solo log
    }

    const data = await res.json();

    setComplaints(prev =>
      prev.map(c => {
        if (c.id !== complaintId) return c;

        const updatedUserVotes = { ...c.votes.userVotes };

        if (currentVote) delete updatedUserVotes[user.id];
        if (newVote) updatedUserVotes[user.id] = newVote;

        const positive = Object.values(updatedUserVotes).filter(v => v === "positive").length;
        const negative = Object.values(updatedUserVotes).filter(v => v === "negative").length;

        return {
          ...c,
          votes: {
            userVotes: updatedUserVotes,
            positive,
            negative,
          },
        };
      })
    );
  } catch (err) {
    console.error("Error al votar:", err);
  }
};



  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="p-6 md:ml-64">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Gestiona y visualiza todos los reclamos</p>
          </div>
          <Link href="/complaints/new">
            <Button size="lg" className="bg-blue-600 text-white px-6 py-3">
              + Crear Nuevo Reclamo
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar reclamos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por entidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las entidades</SelectItem>
             {entities.map((entity, idx) => (
              <SelectItem key={idx} value={entity}>
                {entity}
              </SelectItem>
            ))}

            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="open">Abiertos</SelectItem>
              <SelectItem value="closed">Cerrados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} onVote={handleVote} />
          ))}
        </div>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron reclamos que coincidan con los filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}

