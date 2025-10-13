"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ComplaintMap } from "./ComplaintMap"
import { User, Shield } from "lucide-react"

// Componente de ejemplo para demostrar el sistema de mapas
export function MapExample() {
  const [userRole, setUserRole] = useState<"admin" | "client">("client")
  
  // Ejemplos de ubicaciones para probar
  const exampleLocations = [
    {
      title: "Coordenadas GPS",
      location: "Coordenadas: -34.6037, -58.3816", // Buenos Aires
      description: "Ubicación con coordenadas exactas"
    },
    {
      title: "Dirección Textual",
      location: "Centro de la ciudad",
      description: "Ubicación con dirección legible"
    },
    {
      title: "Dirección Completa",
      location: "Av. Corrientes 1234, Buenos Aires, Argentina",
      description: "Dirección completa con calle y ciudad"
    },
    {
      title: "Sin Ubicación",
      location: null,
      description: "Reclamo sin ubicación especificada"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🗺️ Sistema de Mapas por Roles - Demostración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Este ejemplo demuestra cómo el sistema de mapas se comporta diferente según el rol del usuario.
          </p>
          
          {/* Selector de rol */}
          <div className="flex gap-4">
            <Button
              variant={userRole === "client" ? "default" : "outline"}
              onClick={() => setUserRole("client")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Vista de Usuario
            </Button>
            <Button
              variant={userRole === "admin" ? "default" : "outline"}
              onClick={() => setUserRole("admin")}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Vista de Administrador
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={userRole === "admin" ? "default" : "secondary"}>
              {userRole === "admin" ? "Vista de Administrador" : "Vista de Usuario"}
            </Badge>
            <span className="text-sm text-gray-600">
              {userRole === "admin" 
                ? "Ve coordenadas exactas y zoom máximo" 
                : "Ve direcciones legibles sin coordenadas"
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplos de mapas */}
      <div className="grid gap-6">
        {exampleLocations.map((example, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{example.title}</CardTitle>
              <p className="text-sm text-gray-600">{example.description}</p>
              {example.location && (
                <div className="text-sm bg-gray-50 p-2 rounded font-mono">
                  <strong>Datos:</strong> {example.location}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ComplaintMap
                location={example.location}
                userRole={userRole}
                complaintTitle={example.title}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">👤 Vista de Usuario</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Direcciones legibles sin coordenadas</li>
                <li>• Geocoding automático de coordenadas</li>
                <li>• Privacidad protegida</li>
                <li>• Mapa con zoom estándar (15)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">🛡️ Vista de Administrador</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Coordenadas exactas visibles</li>
                <li>• Zoom máximo para precisión (18)</li>
                <li>• Botón para mostrar/ocultar coordenadas</li>
                <li>• Información técnica completa</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>🔧 Tecnologías:</strong> Google Maps Embed API, Nominatim Geocoding, 
              React Hooks, TypeScript, Tailwind CSS
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}









