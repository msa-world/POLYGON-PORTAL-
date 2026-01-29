'use client'

import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { useState, useCallback, useEffect } from 'react'
import { LayerStyle, DataLayer, MouzaLayer } from '@/lib/types/layer'
import { useMap } from '@/hooks/use-map'
import { DATA_LAYERS, MOUZA_LAYERS } from '@/lib/constants/layers'
import proj4 from 'proj4'

const BBOX_API = "https://rda.ngrok.app/get_bbox"

interface LoadedLayer {
  layer: any
  style: LayerStyle
}

export function useLayer() {
  const [activeLayers, setActiveLayers] = useState<Set<string>>(() => new Set())
  const [loadingLayers, setLoadingLayers] = useState<Set<string>>(() => new Set())
  const [loadedLayers, setLoadedLayers] = useState<Record<string, LoadedLayer>>({})
  const [layerStyles, setLayerStyles] = useState<Record<string, LayerStyle>>({})
  const { getMap, isLeafletLoaded } = useMap()

  // Show coordinates when map is moved
  useEffect(() => {
    const map = getMap()
    if (map && isLeafletLoaded) {
      const updateCoordinates = () => {
        const center = map.getCenter()
        const lon = center.lng.toFixed(6)
        const lat = center.lat.toFixed(6)
        const el = document.getElementById("coordinates")
        if (el) {
          el.innerHTML = `Longitude: ${lon}, Latitude: ${lat}`
        }
      }
      map.on("moveend", updateCoordinates)
      updateCoordinates()
      return () => { map.off("moveend", updateCoordinates) }
    }
  }, [getMap, isLeafletLoaded])

  const rerenderMap = useCallback(() => {
    const map = getMap()
    if (map) map.invalidateSize()
  }, [getMap])

  // Toggle layer (on/off)
  const toggleLayer = useCallback(async (layerId: string, layerData: DataLayer | MouzaLayer) => {
    const map = getMap()
    if (!map || !isLeafletLoaded || !window.L) {
      console.warn('[useLayer] Map not ready. Aborting toggleLayer.')
      return
    }
    const L = window.L

    // If already active → remove
    if (activeLayers.has(layerId)) {
      if (loadedLayers[layerId]) {
        map.removeLayer(loadedLayers[layerId].layer)
        setLoadedLayers(prev => {
          const newLayers = { ...prev }
          delete newLayers[layerId]
          return newLayers
        })
      }
      setActiveLayers(prev => {
        const newSet = new Set(prev)
        newSet.delete(layerId)
        return newSet
      })
      rerenderMap()
      return
    }

    // Else load new layer
    setLoadingLayers(prev => new Set(prev).add(layerId))
    try {
      let geoJsonData: any = null
      let geoJsonLayer: any = null

      // Case 1: Mouza WMS Layer with bbox API
      const mouzaLayer = MOUZA_LAYERS.find(l => l.id === layerId)
      if (mouzaLayer && mouzaLayer.wmsUrl && mouzaLayer.layerName) {
        const bboxRes = await fetch(`${BBOX_API}?layer=${encodeURIComponent(mouzaLayer.layerName)}`)
        if (!bboxRes.ok) throw new Error(`HTTP ${bboxRes.status}`)
        const bboxJson = await bboxRes.json()
        const info = bboxJson[mouzaLayer.layerName]
        if (!info || !info.default_bbox) throw new Error("No bbox found")

        const b = info.default_bbox
        const crs = info.crs || "EPSG:4326"
        let sw, ne
        if (crs === "EPSG:4326") {
          sw = [b.minx, b.miny]
          ne = [b.maxx, b.maxy]
        } else {
          sw = proj4(crs, "EPSG:4326", [b.minx, b.miny])
          ne = proj4(crs, "EPSG:4326", [b.maxx, b.maxy])
        }

        const bounds: L.LatLngBoundsExpression = [
          [sw[1], sw[0]],
          [ne[1], ne[0]]
        ]
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 })
        setTimeout(() => map.invalidateSize(), 300)

        geoJsonLayer = L.tileLayer.wms(mouzaLayer.wmsUrl, {
          layers: mouzaLayer.layerName,
          format: 'image/png',
          transparent: true,
          opacity: layerData.style?.opacity ?? 1
        })
        geoJsonLayer.addTo(map)
      }

      // Case 2: Local GeoJSON Layer
      else if (layerData.filePath) {
        const response = await fetch(layerData.filePath)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        geoJsonData = await response.json()

        geoJsonLayer = L.geoJSON(geoJsonData, {
          style: (feature: any) => {
            let style = {
              color: layerData.style?.color || '#000000',
              opacity: layerData.style?.opacity ?? 1,
              fillOpacity: layerData.style?.fillOpacity ?? 0.5,
              weight: layerData.style?.weight ?? 2,
            }
            const dynamic = layerStyles[layerId]
            if (dynamic) style = { ...style, ...dynamic }
            return style
          },
          onEachFeature: (feature: any, layer: any) => {
            const props = feature.properties || {}
            const label = props.Name || props.name || props.OBJECTID || "Unnamed Feature"
            let popup = `<div class="font-semibold text-blue-600 mb-2">${label}</div>`
            Object.keys(props).forEach(k => {
              if (k !== "Name" && k !== "name" && props[k]) {
                popup += `<div class="text-sm"><strong>${k}:</strong> ${props[k]}</div>`
              }
            })
            layer.bindPopup(popup)
          }
        })
        geoJsonLayer.addTo(map)

        // Zoom to feature extent
        const geoBounds = geoJsonLayer.getBounds()
        if (geoBounds.isValid()) {
          map.fitBounds(geoBounds, { padding: [50, 50], maxZoom: 17 })
          setTimeout(() => map.invalidateSize(), 300)
        }
      }

      // Save loaded layer
      if (geoJsonLayer) {
        setLoadedLayers(prev => ({
          ...prev,
          [layerId]: { layer: geoJsonLayer, style: layerData.style || {} }
        }))
        setActiveLayers(prev => new Set(prev).add(layerId))
        rerenderMap()
      }
    } catch (err) {
      console.error(`[useLayer] Error loading ${layerId}:`, err)
      alert(`Error loading ${layerData.name}: ${err}`)
    } finally {
      setLoadingLayers(prev => {
        const newSet = new Set(prev)
        newSet.delete(layerId)
        return newSet
      })
    }
  }, [getMap, isLeafletLoaded, activeLayers, loadedLayers, layerStyles, rerenderMap])

  const updateLayerStyle = useCallback((layerId: string, style: Partial<LayerStyle>) => {
    setLayerStyles(prev => ({ ...prev, [layerId]: { ...prev[layerId], ...style } }))
    if (loadedLayers[layerId]) {
      const layer = loadedLayers[layerId].layer
      const newStyle = { ...loadedLayers[layerId].style, ...style }
      layer.setStyle?.(() => newStyle)
      setLoadedLayers(prev => ({ ...prev, [layerId]: { ...prev[layerId], style: newStyle } }))
      rerenderMap()
    }
  }, [loadedLayers, rerenderMap])

  return {
    toggleLayer,
    updateLayerStyle,
    isLayerActive: useCallback((id: string) => activeLayers.has(id), [activeLayers]),
    isLayerLoading: useCallback((id: string) => loadingLayers.has(id), [loadingLayers]),
    getLayerStyle: useCallback((id: string) => layerStyles[id] || { opacity: 1, fillOpacity: 0.5 }, [layerStyles]),
    layerStyles,
    loadedLayers,
    activeLayers
  }
}
