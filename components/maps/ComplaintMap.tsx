"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Eye, EyeOff, Navigation, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGeocoding } from "@/hooks/useGeocoding"

interface ComplaintMapProps {
  location: string | null
  userRole: "admin" | "client"
  complaintTitle?: string
  className?: string
}

export function ComplaintMap({ 
  location, 
  userRole, 
  complaintTitle = "Reclamo",
  className = "" 
}: ComplaintMapProps) {
  const [showCoordinates, setShowCoordinates] = useState(false)
  const { coordinates, readableAddress, isLoading, error } = useGeocoding(location, userRole)

  // Función para generar URL del iframe según el rol
  const generateMapUrl = (): string => {
    if (!location) return ""

    if (userRole === "admin" && coordinates) {
      // Vista de administrador: coordenadas exactas con zoom máximo usando OpenStreetMap
      return `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.001},${coordinates.lat-0.001},${coordinates.lng+0.001},${coordinates.lat+0.001}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`
    } else {
      // Vista de usuario: dirección legible usando OpenStreetMap
      const searchQuery = readableAddress || location
      return `https://www.openstreetmap.org/export/embed.html?bbox=-58.5,-34.7,-58.3,-34.5&layer=mapnik&q=${encodeURIComponent(searchQuery)}`
    }
  }

  if (!location) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se especificó ubicación para este reclamo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const mapUrl = generateMapUrl()

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación del Reclamo
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={userRole === "admin" ? "default" : "secondary"}>
              {userRole === "admin" ? "Vista Admin" : "Vista Pública"}
            </Badge>
            {userRole === "admin" && coordinates && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCoordinates(!showCoordinates)}
                className="h-8"
              >
                {showCoordinates ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información de ubicación */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Navigation className="h-4 w-4" />
            <span className="font-medium">Dirección:</span>
          </div>
          <div className="text-sm bg-gray-50 p-3 rounded-lg">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Obteniendo dirección...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : (
              <span>{readableAddress}</span>
            )}
          </div>
          
          {/* Mostrar coordenadas solo para admin cuando esté habilitado */}
          {userRole === "admin" && coordinates && showCoordinates && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Coordenadas exactas:</span>
              </div>
              <p className="text-sm bg-blue-50 p-3 rounded-lg font-mono">
                Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Mapa embebido */}
        {mapUrl && (
          <div className="w-full h-64 border rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={mapUrl}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mapa de ubicación para ${complaintTitle}`}
            />
          </div>
        )}

        {/* Información adicional según el rol */}
        <div className="text-xs text-gray-500 space-y-1">
          {userRole === "admin" ? (
            <>
              <p>🔍 <strong>Vista de administrador:</strong> Mapa con coordenadas exactas y zoom máximo</p>
              <p>📍 Haz clic en el ícono del ojo para mostrar/ocultar las coordenadas</p>
            </>
          ) : (
            <>
              <p>👁️ <strong>Vista pública:</strong> Mapa con dirección legible sin coordenadas</p>
              <p>🔒 Las coordenadas exactas están protegidas por privacidad</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
