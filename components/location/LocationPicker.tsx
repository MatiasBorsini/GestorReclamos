"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, X } from "lucide-react"

interface LocationPickerProps {
  value: string
  onChange: (location: string) => void
  placeholder?: string
}

export function LocationPicker({ value, onChange, placeholder = "Selecciona una ubicación" }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const mapRef = useRef<HTMLIFrameElement>(null)

  // Coordenadas por defecto (puedes cambiarlas por tu ciudad)
  const defaultCenter = { lat: -34.6037, lng: -58.3816 } // Buenos Aires
  const [mapCenter, setMapCenter] = useState(defaultCenter)

  useEffect(() => {
    if (value) {
      setSelectedLocation(value)
    }
  }, [value])

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location)
    onChange(location)
    setIsOpen(false)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleLocationSelect(searchQuery.trim())
    }
  }

  const clearLocation = () => {
    setSelectedLocation("")
    onChange("")
    setSearchQuery("")
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          handleLocationSelect(location)
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          alert("No se pudo obtener tu ubicación actual")
        }
      )
    } else {
      alert("Tu navegador no soporta geolocalización")
    }
  }

  return (
    <div className="space-y-2">
      <Label>Ubicación</Label>
      
      {/* Input principal */}
      <div className="flex gap-2">
        <Input
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value)
            onChange(e.target.value)
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3"
        >
          <MapPin className="h-4 w-4" />
        </Button>
        {selectedLocation && (
          <Button
            type="button"
            variant="outline"
            onClick={clearLocation}
            className="px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Modal de selección de ubicación */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Seleccionar Ubicación</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Búsqueda */}
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar dirección, ciudad, etc."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Botón de ubicación actual */}
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Usar mi ubicación actual
              </Button>

              {/* Mapa embebido */}
              <div className="w-full h-64 border rounded-lg overflow-hidden">
                <iframe
                  ref={mapRef}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWgUfOq1H0&q=${encodeURIComponent(searchQuery || selectedLocation || 'Buenos Aires')}&zoom=15`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Ubicaciones sugeridas */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ubicaciones comunes:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Centro de la ciudad",
                    "Plaza principal",
                    "Hospital central",
                    "Estación de tren",
                    "Aeropuerto",
                    "Universidad",
                    "Shopping center",
                    "Parque principal"
                  ].map((location) => (
                    <Button
                      key={location}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLocationSelect(location)}
                      className="text-left justify-start"
                    >
                      {location}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleLocationSelect(searchQuery || selectedLocation)}
                  className="flex-1"
                  disabled={!searchQuery && !selectedLocation}
                >
                  Usar esta ubicación
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
