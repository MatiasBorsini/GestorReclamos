"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowLeft, Users, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Dynamic import to prevent SSR issues with Leaflet
const AdminComplaintsMap = dynamic(
  () => import("@/components/maps/AdminComplaintsMap").then(mod => ({ default: mod.AdminComplaintsMap })),
  { 
    ssr: false,
    loading: () => (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Cargando mapa...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

export default function AdminMapPage() {
  const { user } = useAuth()
  const router = useRouter()

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

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mapa de Reclamos</h1>
          </div>
          
          <p className="text-gray-600">
            Visualiza todos los reclamos abiertos en un mapa interactivo
          </p>
        </div>

        {/* Información del mapa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reclamos en Mapa</p>
                  <p className="text-2xl font-bold text-blue-600">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Abiertos</p>
                  <p className="text-2xl font-bold text-green-600">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Con Ubicación</p>
                  <p className="text-2xl font-bold text-orange-600">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">📋 Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">🎯 Navegación:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• <strong>Zoom:</strong> Usa la rueda del mouse o los controles +/-</li>
                  <li>• <strong>Mover:</strong> Arrastra el mapa para navegar</li>
                  <li>• <strong>Marcadores:</strong> Haz clic para ver detalles del reclamo</li>
                </ul>
              </div>
              
            </div>
          </CardContent>
        </Card>

        {/* Mapa principal */}
        <AdminComplaintsMap className="mb-6" />


      </main>
    </div>
  )
}
