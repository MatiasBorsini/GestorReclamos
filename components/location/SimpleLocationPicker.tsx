"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { X, Navigation } from "lucide-react"

// Mapa dinámico (solo en cliente)
const LocationMap = dynamic(
  () => import("@/components/maps/UserCargarUbicacion"),
  { ssr: false }
)

interface SimpleLocationPickerProps {
  value: string
  onChange: (location: string) => void
}

export function SimpleLocationPicker({ value, onChange }: SimpleLocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempCoords, setTempCoords] = useState<[number, number] | null>(null)

  // Guardamos la ubicación temporalmente
  const selectTempCoords = (lat: number, lon: number) => {
    setTempCoords([lat, lon])
  }

  // Obtener ubicación actual (solo actualiza tempCoords)
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        selectTempCoords(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        console.error(err)
        alert("No se pudo obtener tu ubicación actual")
      },
      { enableHighAccuracy: true }
    )
  }

  // Confirmar ubicación seleccionada y actualizar value
  const confirmLocation = () => {
    if (!tempCoords) return alert("Selecciona primero una ubicación")
    const [lat, lon] = tempCoords
    const formatted = `Coordenadas: ${lat.toFixed(6)}, ${lon.toFixed(6)}`
    onChange(formatted) // ⚡ Solo aquí actualizamos el value
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label>Ubicación</Label>
      <div className="flex gap-2">
        <Input value={value} readOnly placeholder="Selecciona la ubicación" className="flex-1" />
        <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>🗺️</Button>
        {value && (
          <Button type="button" variant="outline" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Seleccionar ubicación</CardTitle>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button type="button" onClick={getCurrentLocation} variant="outline" className="w-full">
                <Navigation className="h-4 w-4 mr-2" /> Usar mi ubicación actual
              </Button>

              {/* Mapa: solo muestra tempCoords, no actualiza value hasta confirmar */}
              <LocationMap onSelect={selectTempCoords} coords={tempCoords} />

              <Button type="button" onClick={confirmLocation} className="w-full">
                Confirmar ubicación
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
