"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Eye, EyeOff, Navigation, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGeocoding } from "@/hooks/useGeocoding"

interface ComplaintMapProps {
  location: string | null
  userRole: "admin" | "client"
  complaintTitle?: string
  className?: string
}

export function ComplaintMapNoAPI({ 
  location, 
  userRole, 
  complaintTitle = "Reclamo",
  className = "" 
}: ComplaintMapProps) {
  const [showCoordinates, setShowCoordinates] = useState(false)
  const { coordinates, readableAddress, isLoading, error } = useGeocoding(location, userRole)

  // Función para generar URL de Google Maps (sin API key)
  const generateGoogleMapsUrl = (): string => {
    if (!location) return ""

    if (userRole === "admin" && coordinates) {
      // Vista de administrador: coordenadas exactas
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=18`
    } else {
      // Vista de usuario: dirección legible
      const searchQuery = readableAddress || location
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
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

  const googleMapsUrl = generateGoogleMapsUrl()

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

        {/* Botón para abrir en Google Maps */}
        <div className="w-full">
          <Button
            asChild
            className="w-full"
            variant="outline"
          >
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Ver en Google Maps
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Información adicional según el rol */}
        <div className="text-xs text-gray-500 space-y-1">
          {userRole === "admin" ? (
            <>
              <p>🔍 <strong>Vista de administrador:</strong> Enlace con coordenadas exactas y zoom máximo</p>
              <p>📍 Haz clic en el ícono del ojo para mostrar/ocultar las coordenadas</p>
            </>
          ) : (
            <>
              <p>👁️ <strong>Vista pública:</strong> Enlace con dirección legible sin coordenadas</p>
              <p>🔒 Las coordenadas exactas están protegidas por privacidad</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
