"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Eye, Filter, RefreshCw, AlertCircle } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Link from "next/link"

// Fix de iconos Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface Complaint {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  location: string
  coordinates: { lat: number; lng: number }
  entity: string
  authorName: string
  createdAt: string
  votes: { positive: number; negative: number }
  markerColor: string
}

interface AdminComplaintsMapProps {
  className?: string
}

// 🔹 Componente que ajusta el mapa a los marcadores
function MapUpdater({ complaints }: { complaints: Complaint[] }) {
  const map = useMap()

  useEffect(() => {
    if (complaints.length > 0) {
      const group = L.featureGroup(
        complaints.map(c => L.marker([c.coordinates.lat, c.coordinates.lng]))
      )
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [complaints, map])

  return null
}

// 🔹 Componente principal del mapa
function MapComponent({
  complaints,
  selectedCategory,
}: {
  complaints: Complaint[]
  selectedCategory: string
}) {
  const filteredComplaints =
    selectedCategory === "all"
      ? complaints
      : complaints.filter(c => c.category === selectedCategory)

  // Fix para evitar doble inicialización (Next.js + React Strict Mode)
  useEffect(() => {
    const container = L.DomUtil.get("map-container")
    if (container != null) {
      ;(container as any)._leaflet_id = null
    }
  }, [])

  const createCustomIcon = (color: string) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color:${color};
        width:20px;
        height:20px;
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

  return (
    <MapContainer
      id="map-container" // 👈 clave para el fix
      center={[-34.6037, -58.3816]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapUpdater complaints={filteredComplaints} />

      {filteredComplaints.map(c => (
        <Marker
          key={c.id}
          position={[c.coordinates.lat, c.coordinates.lng]}
          icon={createCustomIcon(c.markerColor)}
        >
          <Popup>
            <div className="p-2 min-w-[250px]">
              <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Categoría:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {c.category}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Entidad:</span>
                  <span className="ml-1">{c.entity}</span>
                </div>
                <div>
                  <span className="font-medium">Autor:</span>
                  <span className="ml-1">{c.authorName}</span>
                </div>
                <div>
                  <span className="font-medium">Ubicación:</span>
                  <span className="ml-1 text-xs">{c.location}</span>
                </div>
                <div>
                  <span className="font-medium">Votos:</span>
                  <span className="ml-1">
                    👍 {c.votes.positive} 👎 {c.votes.negative}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Creado:</span>
                  <span className="ml-1">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t">
                <Link href={`/complaints/${c.id}`}>
                  <Button size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export function AdminComplaintsMap({ className = "" }: AdminComplaintsMapProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  // Evita renderizar el mapa en SSR / primera pasada
  useEffect(() => setMounted(true), [])

  // Cargar reclamos desde la API
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch("/api/admin/complaints-map")
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Error al cargar reclamos")
        setComplaints(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  const categories = ["all", ...new Set(complaints.map(c => c.category))]

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p>Cargando mapa de reclamos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <p className="text-red-600 mb-2">Error al cargar el mapa</p>
            <p className="text-sm text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2" variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (complaints.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No hay reclamos abiertos con ubicación</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Reclamos Abiertos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedCategory === "all"
                ? complaints.length
                : complaints.filter(c => c.category === selectedCategory).length}{" "}
              reclamos
            </Badge>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtro por categoría */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtrar por categoría:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "Todas las categorías" : category}
              </option>
            ))}
          </select>
        </div>

        {/* Contenedor del mapa */}
        <div className="w-full h-96 border rounded-lg overflow-hidden">
          {mounted && (
            <MapComponent complaints={complaints} selectedCategory={selectedCategory} />
          )}
        </div>

        {/* Leyenda */}
        <div className="text-xs text-gray-600">
          <p><strong>Leyenda:</strong></p>
          <div className="flex flex-wrap gap-2 mt-1">
            {Array.from(new Set(complaints.map(c => c.category))).map(category => {
              const color = complaints.find(c => c.category === category)?.markerColor || "gray"
              return (
                <div key={category} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span>{category}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

