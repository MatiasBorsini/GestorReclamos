"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, X, Navigation } from "lucide-react"

interface SimpleLocationPickerProps {
  value: string
  onChange: (location: string) => void
  placeholder?: string
}

export function SimpleLocationPicker({ value, onChange, placeholder = "Selecciona una ubicación" }: SimpleLocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLocationSelect = (location: string) => {
    onChange(location)
    setIsOpen(false)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleLocationSelect(searchQuery.trim())
    }
  }

  const clearLocation = () => {
    onChange("")
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Convertir coordenadas a dirección aproximada
          const location = `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          handleLocationSelect(location)
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          alert("No se pudo obtener tu ubicación actual. Intenta escribir la dirección manualmente.")
        }
      )
    } else {
      alert("Tu navegador no soporta geolocalización")
    }
  }

  const commonLocations = [
    "Centro de la ciudad",
    "Plaza principal", 
    "Hospital central",
    "Estación de tren",
    "Aeropuerto",
    "Universidad",
    "Shopping center",
    "Parque principal",
    "Municipalidad",
    "Comisaría",
    "Bomberos",
    "Escuela primaria",
    "Escuela secundaria",
    "Centro de salud",
    "Farmacia",
    "Supermercado"
  ]

  return (
    <div className="space-y-2">
      <Label>Ubicación</Label>
      
      {/* Input principal */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
        {value && (
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
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden">
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
              {/* Búsqueda manual */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Escribir dirección:</Label>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button type="button" onClick={handleSearch} variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Botón de ubicación actual */}
              <Button
                type="button"
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Usar mi ubicación actual
              </Button>

              {/* Separador */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">o selecciona una opción</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Ubicaciones sugeridas */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ubicaciones comunes:</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {commonLocations.map((location) => (
                    <Button
                      key={location}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLocationSelect(location)}
                      className="text-left justify-start text-xs"
                    >
                      {location}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Puedes escribir cualquier dirección, 
                  intersección o punto de referencia conocido.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={() => handleLocationSelect(searchQuery)}
                  className="flex-1"
                  disabled={!searchQuery.trim()}
                >
                  Usar dirección escrita
                </Button>
                <Button
                  type="button"
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
