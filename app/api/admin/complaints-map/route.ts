import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Obtener reclamos abiertos para el mapa de administradores
export async function GET() {
  try {
    // Obtener solo reclamos abiertos
    const complaints = await prisma.complaint.findMany({
      where: { status: "open" },
      include: { 
        author: true, 
        entidad: true, 
        userVotes: true 
      },
      orderBy: { createdAt: "desc" }
    });

    // Procesar reclamos y extraer coordenadas
    const processedComplaints = complaints.map((complaint) => {
      // Función para extraer coordenadas del string de ubicación
      const parseCoordinates = (locationString: string): { lat: number; lng: number } | null => {
        const coordPattern = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/
        const match = locationString.match(coordPattern)
        
        if (match) {
          const lat = parseFloat(match[1])
          const lng = parseFloat(match[2])
          
          // Validar que las coordenadas estén en rangos válidos
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat, lng }
          }
        }
        
        return null
      }

      const coordinates = complaint.location ? parseCoordinates(complaint.location) : null

      return {
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        subcategory: complaint.subcategory,
        location: complaint.location,
        coordinates,
        entity: complaint.entidad?.nombre || "No especificada",
        authorName: complaint.author.name,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        votes: {
          positive: complaint.userVotes.filter((v) => v.type === "positive").length,
          negative: complaint.userVotes.filter((v) => v.type === "negative").length,
        },
        // Determinar color del marcador según categoría
        markerColor: getMarkerColor(complaint.category)
      }
    })

    // Filtrar solo reclamos que tienen coordenadas válidas
    const complaintsWithCoordinates = processedComplaints.filter(complaint => complaint.coordinates)

    return NextResponse.json({
      success: true,
      data: complaintsWithCoordinates,
      total: complaintsWithCoordinates.length,
      withoutCoordinates: processedComplaints.length - complaintsWithCoordinates.length
    });

  } catch (error) {
    console.error("Error al obtener reclamos para el mapa:", error);
    return NextResponse.json({ 
      error: "Error al obtener reclamos para el mapa" 
    }, { status: 500 });
  }
}

// Función para determinar el color del marcador según la categoría
function getMarkerColor(category: string): string {
  const categoryColors: { [key: string]: string } = {
    'Infraestructura': 'red',
    'Servicios Públicos': 'blue',
    'Ambiente': 'green',
    'Seguridad': 'orange',
    'Salud': 'purple',
    'Educación': 'yellow',
    'Transporte': 'cyan',
    'Otros': 'gray'
  }

  return categoryColors[category] || 'gray'
}









