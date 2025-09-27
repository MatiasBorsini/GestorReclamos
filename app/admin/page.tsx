"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer } from "@/components/ui/chart"
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Filter,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import type { Complaint } from "@/types/complaint"
import type { User } from "@/types/user"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Estados
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [showAllComplaints, setShowAllComplaints] = useState(false)

  // Redirigir si no es admin
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (user.role !== "admin") {
      router.push("/dashboard")
      return
    }
  }, [user, router])

  // Fetch reclamos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resComplaints = await fetch("/api/complaints")
        const dataComplaints: Complaint[] = await resComplaints.json()
        setComplaints(dataComplaints)

        const resUsers = await fetch("/api/admin/users")
        const dataUsers: User[] = await resUsers.json()
        setUsers(dataUsers)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }
    fetchData()
  }, [])

  // Filtrado
  useEffect(() => {
    let filtered = complaints
    if (statusFilter !== "all") filtered = filtered.filter(c => c.status === statusFilter)
    if (entityFilter !== "all") filtered = filtered.filter(c => c.entity === entityFilter)
    setFilteredComplaints(filtered)
  }, [statusFilter, entityFilter, complaints])

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Estadísticas
  const totalComplaints = complaints.length
  const openComplaints = complaints.filter(c => c.status === "open").length
  const closedComplaints = complaints.filter(c => c.status === "closed").length
  const totalUsers = users.filter(u => u.role === "client").length

  const uniqueEntities = Array.from(new Set(complaints.map(c => c.entity)))

  const complaintsByEntity = Object.entries(
    complaints.reduce((acc, c) => {
      acc[c.entity] = (acc[c.entity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([entity, count]) => ({
    entity: entity.length > 12 ? entity.substring(0, 12) + "..." : entity,
    fullEntity: entity,
    count,
    percentage: Math.round((count / totalComplaints) * 100),
  }))

  const votesData = complaints.map(c => ({
    name: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
    fullTitle: c.title,
    positivos: c.votes.positive,
    negativos: c.votes.negative,
    total: c.votes.positive + c.votes.negative,
    entity: c.entity,
  })).filter(d => d.total > 0)

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 md:ml-64">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
        <p className="text-gray-600">Análisis detallado del sistema de gestión de reclamos</p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reclamos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComplaints}</div>
            <p className="text-xs text-muted-foreground">Todos los reclamos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reclamos Abiertos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{openComplaints}</div>
            <p className="text-xs text-muted-foreground">Pendientes de resolución</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reclamos Cerrados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{closedComplaints}</div>
            <p className="text-xs text-muted-foreground">Resueltos exitosamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Clientes registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reclamos por Entidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{ count: { label: "Cantidad de Reclamos", color: "#3b82f6" } }}>
              <BarChart data={complaintsByEntity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="entity" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: "Cantidad", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Satisfacción Ciudadana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{ positivos: { label: "Votos Positivos", color: "#10b981" }, negativos: { label: "Votos Negativos", color: "#ef4444" } }}>
              <AreaChart data={votesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="positivos" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="negativos" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reclamos recientes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Reclamos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentComplaints.map(c => (
              <div key={c.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{c.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <Badge variant={c.status === "open" ? "default" : "secondary"}>
                      {c.status === "open" ? "Abierto" : "Cerrado"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
