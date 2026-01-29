'use client'

import { useCallback, useState } from 'react'
import { useMapContext } from '@/lib/contexts/map-context'

// Declare global L for Leaflet
declare global {
  interface Window {
    L: any
  }
}

export function useMap() {
  const { mapInstance, setMapInstance, isLeafletLoaded, baseLayersRef } = useMapContext()
  const [currentBaseLayer, setCurrentBaseLayer] = useState('satellite')

  const initializeMap = useCallback((container: HTMLElement) => {
    if (!isLeafletLoaded || !window.L) {
      return null
    }

    // Check if map is already initialized on this specific container
    // This prevents "Map container is already initialized" error
    if ((container as any)._leaflet_id) {
      console.log('Map container already has a map instance, reusing found instance if possible or skipping')
      return mapInstance
    }

    // If we have a stored map instance but it is NOT attached to this container (because container is new),
    // we strictly speaking must create a new map for the new container. 
    // The previous instance is effectively dead/lost if its container was removed.
    if (mapInstance) {
      // If mapInstance exists, verify if it's still valid/attached.
      // Actually, if we are here, and container._leaflet_id is undefined, it means THIS container is new.
      // So we should re-initialize.
      // But we might want to clean up the OLD map instance first to avoid memory leaks
      try {
        mapInstance.remove()
      } catch (e) {
        console.warn('Failed to remove old map instance', e)
      }
      setMapInstance(null)
    }

    const L = window.L

    try {
      // Fix for default markers
      if (L.Icon && L.Icon.Default) {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
      }

      // Initialize map
      const map = L.map(container, {
        zoomControl: false,
        attributionControl: false
      }).setView([33.6844, 73.0479], 11)

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Initialize base layers with BETTER URLs
      const baseLayers = {
        satellite: L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
          }
        ),
        googleSatellite: L.tileLayer(
          'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Satellite',
            maxZoom: 20
          }
        ),
        osm: L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { attribution: '© OpenStreetMap contributors' }
        ),
        terrain: L.tileLayer(
          'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
          {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google Terrain'
          }
        ),
        carto: L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          { attribution: '© CartoDB' }
        ),
        dark: L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          { attribution: '© CartoDB' }
        )
      }

      // Store in ref
      baseLayersRef.current = baseLayers

      // Default to Esri Satellite (most reliable for Pakistan/Global usually) or Google if preferred
      // The user complained about imagery not loading. Esri is usually very stable.
      baseLayers.satellite.addTo(map)

      // Store globally in context
      setMapInstance(map)

      console.log('Map initialized successfully with base layers')
      return map
    } catch (error) {
      console.error('Error initializing map:', error)
      return null
    }
  }, [isLeafletLoaded, mapInstance, setMapInstance, baseLayersRef])

  const switchBaseLayer = useCallback((layerId: string) => {
    const map = mapInstance
    // Map layer ID to key in baseLayers object
    let key = layerId;
    if (layerId === 'esri') key = 'satellite'; // Legacy mapping if needed

    if (!map || !baseLayersRef.current[key]) {
      console.log('Cannot switch base layer - map or layer not found', { map: !!map, layer: !!baseLayersRef.current[key] })
      return
    }

    console.log(`Switching to base layer: ${key}`)

    try {
      // Remove current base layer (iterate all and remove to be safe, or track current)
      Object.values(baseLayersRef.current).forEach((layer: any) => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer)
        }
      })

      // Add new base layer
      baseLayersRef.current[key].addTo(map)
      setCurrentBaseLayer(key)
    } catch (error) {
      console.error('Error switching base layer:', error)
    }
  }, [mapInstance, baseLayersRef])

  const getMap = useCallback(() => {
    return mapInstance
  }, [mapInstance])

  return {
    map: mapInstance,
    initializeMap,
    switchBaseLayer,
    currentBaseLayer,
    isLeafletLoaded,
    getMap
  }
}
