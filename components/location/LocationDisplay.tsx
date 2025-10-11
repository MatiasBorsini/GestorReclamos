"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation } from "lucide-react"
import { useGeocoding } from "@/hooks/useGeocoding"

interface LocationDisplayProps {
  location: string | null
  userRole: "admin" | "client"
  showIcon?: boolean
  className?: string
  compact?: boolean
}

export function LocationDisplay({ 
  location, 
  userRole, 
  showIcon = true,
  className = "",
  compact = false
}: LocationDisplayProps) {
  const { coordinates, readableAddress, isLoading, error } = useGeocoding(location, userRole)

  if (!location) {
    return null
  }

  const displayText = readableAddress || location
  const Icon = showIcon ? (compact ? Navigation : MapPin) : null

  if (compact) {
    return (
      <span className={`text-sm text-gray-500 ${className}`}>
        {Icon && <Icon className="h-3 w-3 inline mr-1" />}
        {isLoading ? "Obteniendo dirección..." : displayText}
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}>
      {Icon && <Icon className="h-4 w-4" />}
      <span>
        {isLoading ? (
          <span className="flex items-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
            Obteniendo dirección...
          </span>
        ) : error ? (
          <span className="text-amber-600">{location}</span>
        ) : (
          displayText
        )}
      </span>
    </div>
  )
}






