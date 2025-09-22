"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  PieChart,
  Eye,
  Filter,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts"
import { ReactElement } from "react"

import { mockComplaints } from "@/lib/mock-data"
import { mockUsers } from "@/lib/mock-admin-data"
import type { Complaint } from "@/types/complaint"
import { useRouter } from "next/navigation"
import { ChartContainer } from "@/components/ui/chart"

type CustomTooltipProps = {
  active?: boolean
  payload?: any[]
  label?: string | number
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [complaints] = useState<Complaint[]>(mockComplaints)
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>(complaints)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [showAllComplaints, setShowAllComplaints] = useState(false)

  const uniqueEntities = Array.from(new Set(complaints.map((c) => c.entity)))

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

  useEffect(() => {
    let filtered = complaints
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }
    if (entityFilter !== "all") {
      filtered = filtered.filter((c) => c.entity === entityFilter)
    }
    setFilteredComplaints(filtered)
  }, [statusFilter, entityFilter, complaints])

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalComplaints = complaints.length
  const openComplaints = complaints.filter((c) => c.status === "open").length
  const closedComplaints = complaints.filter((c) => c.status === "closed").length
  const totalUsers = mockUsers.filter((u) => u.role === "client").length

  const mostVotedComplaints = [...complaints]
    .sort((a, b) => b.votes.positive + b.votes.negative - (a.votes.positive + a.votes.negative))
    .slice(0, 5)

  const complaintsByEntity = Object.entries(
    complaints.reduce((acc, complaint) => {
      acc[complaint.entity] = (acc[complaint.entity] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  ).map(([entity, count]) => ({
    entity: entity.length > 12 ? entity.substring(0, 12) + "..." : entity,
    fullEntity: entity,
    count,
    percentage: Math.round((count / totalComplaints) * 100),
  }))

  const statusData = [
    {
      name: "Abiertos",
      value: openComplaints,
      color: "#f59e0b",
      percentage: Math.round((openComplaints / totalComplaints) * 100),
      description: "Reclamos pendientes de resolución",
    },
    {
      name: "Cerrados",
      value: closedComplaints,
      color: "#10b981",
      percentage: Math.round((closedComplaints / totalComplaints) * 100),
      description: "Reclamos resueltos y cerrados",
    },
  ]

  const monthlyData = [
    { month: "Enero", complaints: 12, resolved: 8, pending: 4, resolutionRate: 67 },
    { month: "Febrero", complaints: 19, resolved: 15, pending: 4, resolutionRate: 79 },
    { month: "Marzo", complaints: 15, resolved: 12, pending: 3, resolutionRate: 80 },
    { month: "Abril", complaints: 22, resolved: 18, pending: 4, resolutionRate: 82 },
    { month: "Mayo", complaints: 28, resolved: 20, pending: 8, resolutionRate: 71 },
    { month: "Junio", complaints: 25, resolved: 22, pending: 3, resolutionRate: 88 },
  ]

  const votesData = complaints
    .map((c) => ({
      name: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
      fullTitle: c.title,
      positivos: c.votes.positive,
      negativos: c.votes.negative,
      total: c.votes.positive + c.votes.negative,
      satisfactionRate:
        c.votes.positive + c.votes.negative > 0
          ? Math.round((c.votes.positive / (c.votes.positive + c.votes.negative)) * 100)
          : 0,
      entity: c.entity,
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  const categoryData = Object.entries(
    complaints.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  )
    .map(([category, count]) => ({
      category: category.length > 15 ? category.substring(0, 15) + "..." : category,
      fullCategory: category,
      count,
      percentage: Math.round((count / totalComplaints) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const recentComplaints = [...complaints]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  type TooltipData<T> = TooltipProps<number, string> & { payload?: T[]; label?: string }

  return (
    <div className="p-6 md:ml-64">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
        <p className="text-gray-600">Análisis detallado del sistema de gestión de reclamos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Cards */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* BarChart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribución de Reclamos por Entidad
            </CardTitle>
            <p className="text-sm text-gray-600">
              Cantidad y porcentaje de reclamos recibidos por cada tipo de institución
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[300px]"
              config={{
                count: { label: "Cantidad de Reclamos", color: "#3b82f6" },
              }}
            >
              <BarChart data={complaintsByEntity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="entity" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: "Cantidad de Reclamos", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  content={(props: CustomTooltipProps): ReactElement | null => {
                    const { active, payload } = props
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload as { fullEntity: string; count: number; percentage: number }
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{data.fullEntity}</p>
                          <p className="text-blue-600">
                            <span className="font-medium">{data.count}</span> reclamos
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">{data.percentage}%</span> del total
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* AreaChart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Satisfacción Ciudadana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[300px]"
              config={{
                positivos: { label: "Votos Positivos", color: "#10b981" },
                negativos: { label: "Votos Negativos", color: "#ef4444" },
              }}
            >
              <AreaChart data={votesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  content={(props: CustomTooltipProps): ReactElement | null => {
                    const { active, payload } = props
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg max-w-xs">
                          <p className="font-semibold mb-2">{data.fullTitle}</p>
                          <p className="text-sm text-gray-600 mb-2">Entidad: {data.entity}</p>
                          <div className="space-y-1">
                            <p className="text-green-600">
                              👍 Positivos: <span className="font-medium">{data.positivos}</span>
                            </p>
                            <p className="text-red-600">
                              👎 Negativos: <span className="font-medium">{data.negativos}</span>
                            </p>
                            <p className="text-gray-600 border-t pt-1">
                              📊 Total votos: <span className="font-medium">{data.total}</span>
                            </p>
                            <p className="text-blue-600">
                              😊 Satisfacción: <span className="font-medium">{data.satisfactionRate}%</span>
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area type="monotone" dataKey="positivos" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="negativos" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Categorías Más Reportadas
            </CardTitle>
            <p className="text-sm text-gray-600">Tipos de problemas más frecuentes reportados por los ciudadanos</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryData.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm" title={item.fullCategory}>
                        {item.category}
                      </p>
                      <p className="text-xs text-gray-500">{item.count} reclamos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Voted Complaints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Reclamos Más Votados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostVotedComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-2">{complaint.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {complaint.entity}
                      </Badge>
                      <span className="text-xs text-gray-500">{complaint.authorName}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium">
                      {complaint.votes.positive + complaint.votes.negative} votos
                    </div>
                    <div className="text-xs text-gray-500">
                      +{complaint.votes.positive} -{complaint.votes.negative}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reclamos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComplaints.slice(0, 3).map((complaint) => (
                <div key={complaint.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{complaint.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{complaint.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{complaint.entity}</Badge>
                      <Badge variant="secondary">{complaint.category}</Badge>
                      <Badge
                        className={
                          complaint.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {complaint.status === "open" ? "Abierto" : "Cerrado"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium">{complaint.authorName}</p>
                    <p className="text-xs text-gray-500">{complaint.createdAt.toLocaleDateString()}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {complaint.votes.positive + complaint.votes.negative} votos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Complaints Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Todos los Reclamos del Sistema
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Listado completo de todos los reclamos registrados por los clientes
              </p>
            </div>
            <Button
              onClick={() => setShowAllComplaints(!showAllComplaints)}
              variant={showAllComplaints ? "secondary" : "default"}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showAllComplaints ? "Ocultar Lista" : "Ver Todos"}
            </Button>
          </div>
        </CardHeader>

        {showAllComplaints && (
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="open">Abiertos</SelectItem>
                  <SelectItem value="closed">Cerrados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  {uniqueEntities.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 flex items-center">
                Mostrando {filteredComplaints.length} de {complaints.length} reclamos
              </div>
            </div>

            {/* Complaints Table */}
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{complaint.title}</h3>
                          <Badge
                            className={
                              complaint.status === "open"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            }
                          >
                            {complaint.status === "open" ? "Abierto" : "Cerrado"}
                          </Badge>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{complaint.description}</p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {complaint.entity}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {complaint.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {complaint.subcategory}
                          </Badge>
                        </div>

                        {complaint.location && (
                          <div className="text-xs text-gray-500 mb-2">📍 Ubicación: {complaint.location}</div>
                        )}
                      </div>

                      {/* Right Side Info */}
                      <div className="lg:text-right lg:min-w-[200px]">
                        <div className="mb-2">
                          <p className="font-medium text-sm text-gray-900">{complaint.authorName}</p>
                          <p className="text-xs text-gray-500">
                            {complaint.createdAt.toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div className="flex lg:flex-col gap-4 lg:gap-2">
                          <div className="text-center lg:text-right">
                            <p className="text-xs text-gray-500">Votos Totales</p>
                            <p className="font-bold text-lg">{complaint.votes.positive + complaint.votes.negative}</p>
                          </div>

                          <div className="flex lg:flex-col gap-2 lg:gap-1">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-green-600">👍</span>
                              <span className="font-medium">{complaint.votes.positive}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-red-600">👎</span>
                              <span className="font-medium">{complaint.votes.negative}</span>
                            </div>
                          </div>
                        </div>

                        {complaint.votes.positive + complaint.votes.negative > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-gray-500">Satisfacción: </span>
                            <span className="font-medium text-blue-600">
                              {Math.round(
                                (complaint.votes.positive / (complaint.votes.positive + complaint.votes.negative)) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {complaint.imageUrl && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">📷 Imagen adjunta disponible</p>
                      </div>
                    )}
                  </div>
                ))}

                {filteredComplaints.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron reclamos con los filtros seleccionados</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
