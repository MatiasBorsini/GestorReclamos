"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// 🔹 Fix de iconos Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface UserCargarUbicacionProps {
  coords: [number, number] | null
  onSelect: (lat: number, lon: number) => void
}

// 🔹 Componente para capturar clics
function LocationMarker({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function UserCargarUbicacion({ coords, onSelect }: UserCargarUbicacionProps) {
  useEffect(() => {
    // 💥 Fix definitivo: limpia instancias previas
    const container = L.DomUtil.get("map-user-container")
    if (container != null) {
      // @ts-ignore
      container._leaflet_id = null
    }
  }, [])

  return (
    <MapContainer
      id="map-user-container" // 👈 ID único para limpiar correctamente
      center={coords || [-31.4201, -64.1888]} // Córdoba por defecto
      zoom={13}
      style={{ height: "400px", borderRadius: "0.5rem", zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {coords && <Marker position={coords} />}
      <LocationMarker onSelect={onSelect} />
    </MapContainer>
  )
}
