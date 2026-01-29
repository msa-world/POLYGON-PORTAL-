'use client'

import { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react'

interface MapContextType {
  mapInstance: any | null
  setMapInstance: (map: any) => void
  isLeafletLoaded: boolean
  baseLayersRef: React.MutableRefObject<Record<string, any>>
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapInstance, setMapInstance] = useState<any | null>(null)
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const baseLayersRef = useRef<Record<string, any>>({})

  // Global Leaflet loading check
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== 'undefined' && window.L && window.L.map) {
        setIsLeafletLoaded(true)
        return true
      }
      return false
    }

    if (checkLeaflet()) return

    // Poll for Leaflet
    const interval = setInterval(() => {
      if (checkLeaflet()) {
        clearInterval(interval)
      }
    }, 100)

    // Timeout fallback after 3 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (!checkLeaflet()) {
        console.warn('Leaflet loading timed out, forcing state (scripts might be slow)')
        setIsLeafletLoaded(true)
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <MapContext.Provider value={{
      mapInstance,
      setMapInstance,
      isLeafletLoaded,
      baseLayersRef
    }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider')
  }
  return context
}
