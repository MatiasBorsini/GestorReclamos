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

  // Estadísticas Generales
  const totalComplaints = complaints.length
  const openComplaints = complaints.filter(c => c.status === "open").length
  const closedComplaints = complaints.filter(c => c.status === "closed").length
  const totalUsers = users.filter(u => u.role === "client").length
  
  // Nuevas estadísticas generales
  const complaintsWithLocation = complaints.filter(c => c.location && c.location.trim() !== "").length
  const complaintsWithoutLocation = totalComplaints - complaintsWithLocation
  const complaintsWithImages = complaints.filter(c => c.imageUrl && c.imageUrl.trim() !== "").length
  
  // Estadísticas Temporales
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const complaintsLastDay = complaints.filter(c => new Date(c.createdAt) >= oneDayAgo).length
  const complaintsLastWeek = complaints.filter(c => new Date(c.createdAt) >= oneWeekAgo).length
  const complaintsLastMonth = complaints.filter(c => new Date(c.createdAt) >= oneMonthAgo).length
  
  const resolutionRate = totalComplaints > 0 ? Math.round((closedComplaints / totalComplaints) * 100) : 0
  
  // Tiempo promedio de resolución (solo para reclamos cerrados)
  const closedComplaintsWithDates = complaints.filter(c => c.status === "closed")
  const avgResolutionTime = closedComplaintsWithDates.length > 0 
    ? closedComplaintsWithDates.reduce((acc, c) => {
        const created = new Date(c.createdAt)
        const updated = new Date(c.updatedAt)
        const diffDays = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        return acc + diffDays
      }, 0) / closedComplaintsWithDates.length
    : 0
  
  // Estadísticas por Categoría
  const complaintsByCategory = Object.entries(
    complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / totalComplaints) * 100)
  })).sort((a, b) => b.count - a.count)
  
  const top5Categories = complaintsByCategory.slice(0, 5)
  
  const complaintsBySubcategory = Object.entries(
    complaints.reduce((acc, c) => {
      acc[c.subcategory] = (acc[c.subcategory] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([subcategory, count]) => ({
    subcategory,
    count,
    percentage: Math.round((count / totalComplaints) * 100)
  })).sort((a, b) => b.count - a.count)
  
  const top5Subcategories = complaintsBySubcategory.slice(0, 5)
  
  // Estadísticas de Participación
  const complaintsWithVotes = complaints.filter(c => (c.votes.positive + c.votes.negative) > 0).length
  const complaintsWithVotesPercentage = totalComplaints > 0 ? Math.round((complaintsWithVotes / totalComplaints) * 100) : 0
  
  const mostVotedComplaints = [...complaints]
    .filter(c => (c.votes.positive + c.votes.negative) > 0)
    .sort((a, b) => (b.votes.positive + b.votes.negative) - (a.votes.positive + a.votes.negative))
    .slice(0, 5)
  
  const mostActiveUsers = Object.entries(
    complaints.reduce((acc, c) => {
      acc[c.authorId] = (acc[c.authorId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([userId, count]) => {
    const user = users.find(u => u.id === userId)
    return {
      userId,
      userName: user?.name || "Usuario desconocido",
      count
    }
  }).sort((a, b) => b.count - a.count).slice(0, 5)
  
  // Tendencia mensual
  const monthlyTrend = Object.entries(
    complaints.reduce((acc, c) => {
      const date = new Date(c.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([month, count]) => ({
    month,
    count
  })).sort((a, b) => a.month.localeCompare(b.month))

  // Estadísticas Geográficas
  const parseCoordinates = (locationString: string): { lat: number; lng: number } | null => {
    const coordPattern = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/
    const match = locationString.match(coordPattern)
    
    if (match) {
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
    return null
  }

  const complaintsWithCoordinates = complaints
    .map(c => ({
      ...c,
      coordinates: c.location ? parseCoordinates(c.location) : null
    }))
    .filter(c => c.coordinates !== null)

  // Función para calcular distancia entre dos puntos (Haversine)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Clustering por proximidad (radio de 1km)
  const clusterComplaints = (complaints: any[], radiusKm: number = 1) => {
    const clusters: any[] = []
    const processed = new Set()

    complaints.forEach(complaint => {
      if (processed.has(complaint.id)) return

      const cluster = [complaint]
      processed.add(complaint.id)

      complaints.forEach(other => {
        if (processed.has(other.id) || other.id === complaint.id) return

        const distance = calculateDistance(
          complaint.coordinates.lat, complaint.coordinates.lng,
          other.coordinates.lat, other.coordinates.lng
        )

        if (distance <= radiusKm) {
          cluster.push(other)
          processed.add(other.id)
        }
      })

      clusters.push({
        center: complaint.coordinates,
        complaints: cluster,
        count: cluster.length,
        radius: radiusKm
      })
    })

    return clusters.sort((a, b) => b.count - a.count)
  }

  const geographicClusters = clusterComplaints(complaintsWithCoordinates, 1)
  
  // Función para geocoding inverso (coordenadas a dirección)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SistemaReclamos/1.0'
          }
        }
      )
      const data = await response.json()
      
      if (data.display_name) {
        // Extraer información relevante de la dirección
        const address = data.display_name
        const parts = address.split(', ')
        
        // Priorizar: calle, barrio, ciudad
        if (parts.length >= 3) {
          return `${parts[0]}, ${parts[1]}, ${parts[2]}`
        } else if (parts.length >= 2) {
          return `${parts[0]}, ${parts[1]}`
        }
        return address
      }
      return `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch (error) {
      console.error('Error en geocoding inverso:', error)
      return `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  // Estado para almacenar direcciones geocodificadas
  const [geocodedZones, setGeocodedZones] = useState<Array<{
    center: { lat: number; lng: number }
    address: string
    count: number
    radius: number
  }>>([])

  // Efecto para geocodificar las zonas
  useEffect(() => {
    const geocodeZones = async () => {
      const top5Zones = geographicClusters.slice(0, 5)
      const geocoded = await Promise.all(
        top5Zones.map(async (zone) => ({
          center: zone.center,
          address: await reverseGeocode(zone.center.lat, zone.center.lng),
          count: zone.count,
          radius: zone.radius
        }))
      )
      setGeocodedZones(geocoded)
    }

    if (geographicClusters.length > 0) {
      geocodeZones()
    }
  }, [geographicClusters])

  const top5Zones = geocodedZones

  // Análisis por cuadrantes (Norte, Sur, Este, Oeste)
  const getQuadrant = (lat: number, lng: number, centerLat: number, centerLng: number) => {
    if (lat >= centerLat && lng >= centerLng) return "Noreste"
    if (lat >= centerLat && lng < centerLng) return "Noroeste"
    if (lat < centerLat && lng >= centerLng) return "Sureste"
    return "Suroeste"
  }

  // Centro de Buenos Aires como referencia
  const cityCenter = { lat: -34.6037, lng: -58.3816 }
  
  const complaintsByQuadrant = complaintsWithCoordinates.reduce((acc, c) => {
    if (c.coordinates) {
      const quadrant = getQuadrant(c.coordinates.lat, c.coordinates.lng, cityCenter.lat, cityCenter.lng)
      acc[quadrant] = (acc[quadrant] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const quadrantData = Object.entries(complaintsByQuadrant).map(([quadrant, count]) => ({
    quadrant,
    count,
    percentage: Math.round((count / complaintsWithCoordinates.length) * 100)
  })).sort((a, b) => b.count - a.count)

  // Métricas de dispersión geográfica
  const allCoordinates = complaintsWithCoordinates
    .map(c => c.coordinates)
    .filter((coord): coord is { lat: number; lng: number } => coord !== null)
  
  const calculateGeographicMetrics = () => {
    if (allCoordinates.length < 2) return null

    // Centroide
    const centroid = {
      lat: allCoordinates.reduce((sum, c) => sum + c.lat, 0) / allCoordinates.length,
      lng: allCoordinates.reduce((sum, c) => sum + c.lng, 0) / allCoordinates.length
    }

    // Distancia promedio al centroide
    const avgDistanceToCentroid = allCoordinates.reduce((sum, c) => {
      return sum + calculateDistance(c.lat, c.lng, centroid.lat, centroid.lng)
    }, 0) / allCoordinates.length

    // Distancia máxima entre reclamos
    let maxDistance = 0
    for (let i = 0; i < allCoordinates.length; i++) {
      for (let j = i + 1; j < allCoordinates.length; j++) {
        const coord1 = allCoordinates[i]
        const coord2 = allCoordinates[j]
        if (coord1 && coord2) {
          const distance = calculateDistance(
            coord1.lat, coord1.lng,
            coord2.lat, coord2.lng
          )
          maxDistance = Math.max(maxDistance, distance)
        }
      }
    }

    return {
      centroid,
      avgDistanceToCentroid: avgDistanceToCentroid,
      maxDistanceBetweenComplaints: maxDistance,
      coverageRadius: maxDistance / 2
    }
  }

  const geographicMetrics = calculateGeographicMetrics()

  // Estado para centroide geocodificado
  const [geocodedCentroid, setGeocodedCentroid] = useState<string>("")

  // Efecto para geocodificar el centroide
  useEffect(() => {
    if (geographicMetrics?.centroid) {
      reverseGeocode(geographicMetrics.centroid.lat, geographicMetrics.centroid.lng)
        .then(address => setGeocodedCentroid(address))
    }
  }, [geographicMetrics])

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

      {/* Cards de estadísticas generales */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Cards de estadísticas de calidad de datos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Calidad de Datos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Con Ubicación</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{complaintsWithLocation}</div>
              <p className="text-xs text-muted-foreground">Georreferenciados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sin Ubicación</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{complaintsWithoutLocation}</div>
              <p className="text-xs text-muted-foreground">Sin coordenadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Con Imágenes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{complaintsWithImages}</div>
              <p className="text-xs text-muted-foreground">Con evidencia visual</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cards de estadísticas temporales */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Estadísticas Temporales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Último Día</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaintsLastDay}</div>
              <p className="text-xs text-muted-foreground">Reclamos en 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Última Semana</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaintsLastWeek}</div>
              <p className="text-xs text-muted-foreground">Reclamos en 7 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Último Mes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaintsLastMonth}</div>
              <p className="text-xs text-muted-foreground">Reclamos en 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Resolución</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">Reclamos resueltos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Análisis Visual
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reclamos por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={{ count: { label: "Cantidad de Reclamos", color: "#3b82f6" } }}>
                <BarChart data={top5Categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
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
                Tendencia Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={{ count: { label: "Reclamos", color: "#10b981" } }}>
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Análisis de participación */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Análisis de Participación
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      </div>

      {/* Análisis detallado por categorías */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Análisis por Categorías
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 5 Categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {top5Categories.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-gray-600">{item.percentage}% del total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{item.count}</p>
                      <p className="text-xs text-gray-500">reclamos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Top 5 Subcategorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {top5Subcategories.map((item, index) => (
                  <div key={item.subcategory} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.subcategory}</p>
                        <p className="text-sm text-gray-600">{item.percentage}% del total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{item.count}</p>
                      <p className="text-xs text-gray-500">reclamos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Análisis de participación ciudadana */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Participación Ciudadana
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Reclamos Más Votados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostVotedComplaints.map((complaint, index) => (
                  <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{complaint.title}</p>
                        <p className="text-xs text-gray-600">{complaint.entity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2">
                        <span className="text-sm text-green-600 font-bold">+{complaint.votes.positive}</span>
                        <span className="text-sm text-red-600 font-bold">-{complaint.votes.negative}</span>
                      </div>
                      <p className="text-xs text-gray-500">{complaint.votes.positive + complaint.votes.negative} votos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuarios Más Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostActiveUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.userName}</p>
                        <p className="text-sm text-gray-600">Usuario activo</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{user.count}</p>
                      <p className="text-xs text-gray-500">reclamos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Métricas de Rendimiento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio de Resolución</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{avgResolutionTime.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">días promedio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Participación en Votos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{complaintsWithVotesPercentage}%</div>
              <p className="text-xs text-muted-foreground">reclamos con votos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calidad de Datos</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalComplaints > 0 ? Math.round(((complaintsWithLocation + complaintsWithImages) / (totalComplaints * 2)) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">con ubicación e imágenes</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Análisis geográfico */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Análisis Geográfico
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Zonas con Más Reclamos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {top5Zones.length > 0 ? (
                  top5Zones.map((zone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold text-red-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{zone.address}</p>
                          <p className="text-xs text-gray-600">
                            {zone.count} reclamos en 1km de radio
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{zone.count}</p>
                        <p className="text-xs text-gray-500">reclamos</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Cargando ubicaciones...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Distribución por Cuadrantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={{ count: { label: "Reclamos", color: "#3b82f6" } }}>
                <BarChart data={quadrantData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quadrant" tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: "Cantidad", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas geográficas avanzadas */}
      {geographicMetrics && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Métricas Geográficas Avanzadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Centroide</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {geocodedCentroid ? (
                  <>
                    <div className="text-sm font-bold text-blue-600 mb-1">
                      {geocodedCentroid}
                    </div>
                    <p className="text-xs text-muted-foreground">Centro de gravedad</p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-blue-600">
                      {geographicMetrics.centroid.lat.toFixed(4)}
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                      {geographicMetrics.centroid.lng.toFixed(4)}
                    </div>
                    <p className="text-xs text-muted-foreground">Cargando dirección...</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Distancia Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{geographicMetrics.avgDistanceToCentroid.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">km al centroide</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Distancia Máxima</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{geographicMetrics.maxDistanceBetweenComplaints.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">km entre reclamos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Radio de Cobertura</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{geographicMetrics.coverageRadius.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">km de cobertura</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{c.category}</Badge>
                      <Badge variant="outline" className="text-xs">{c.entity}</Badge>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <Badge variant={c.status === "open" ? "default" : "secondary"}>
                      {c.status === "open" ? "Abierto" : "Cerrado"}
                    </Badge>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
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
