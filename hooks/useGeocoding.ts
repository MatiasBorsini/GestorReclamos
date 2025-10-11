import { useState, useEffect } from 'react'

interface Coordinates {
  lat: number
  lng: number
}

interface GeocodingResult {
  coordinates: Coordinates | null
  readableAddress: string
  isLoading: boolean
  error: string | null
}

export function useGeocoding(location: string | null, userRole: 'admin' | 'client'): GeocodingResult {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [readableAddress, setReadableAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para extraer coordenadas del string de ubicación
  const parseCoordinates = (locationString: string): Coordinates | null => {
    // Buscar patrones como "lat, lng" o "Coordenadas: lat, lng"
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

  // Función para convertir coordenadas a dirección legible
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Usar Nominatim (OpenStreetMap) que es gratuito y no requiere API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ComplaintSystem/1.0'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Error en geocoding')
      }
      
      const data = await response.json()
      
      if (data.display_name) {
        // Extraer información relevante de la dirección
        const address = data.display_name
        const parts = address.split(', ')
        
        // Tomar las primeras 3-4 partes para una dirección más legible
        return parts.slice(0, 4).join(', ')
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.error('Error en reverse geocoding:', error)
      throw error
    }
  }

  // Efecto principal
  useEffect(() => {
    if (!location) {
      setCoordinates(null)
      setReadableAddress('')
      setError(null)
      return
    }

    const coords = parseCoordinates(location)
    
    if (coords) {
      setCoordinates(coords)
      
      // Si es usuario común, convertir coordenadas a dirección legible
      if (userRole === 'client') {
        setIsLoading(true)
        setError(null)
        
        reverseGeocode(coords.lat, coords.lng)
          .then((address) => {
            setReadableAddress(address)
          })
          .catch((err) => {
            setError('No se pudo obtener la dirección')
            setReadableAddress(location) // Fallback a la ubicación original
          })
          .finally(() => {
            setIsLoading(false)
          })
      } else {
        // Para admin, usar la ubicación tal como está
        setReadableAddress(location)
      }
    } else {
      // Si no son coordenadas, usar la ubicación tal como está
      setCoordinates(null)
      setReadableAddress(location)
    }
  }, [location, userRole])

  return {
    coordinates,
    readableAddress,
    isLoading,
    error
  }
}






