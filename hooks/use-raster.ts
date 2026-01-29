"use client"

import { useState, useCallback, useRef } from "react"
import type { RasterStyle } from "@/lib/types/layer"
import { useMap } from "@/hooks/use-map"

const BBOX_API = "https://rda.ngrok.app/get_bbox"

interface LoadedRaster {
  layer: any
  style: RasterStyle
  layerName?: string
}

export function useRaster() {
  const [activeRasters, setActiveRasters] = useState<Set<string>>(() => new Set())
  const [loadingRasters, setLoadingRasters] = useState<Set<string>>(() => new Set())
  const [loadedRasters, setLoadedRasters] = useState<Record<string, LoadedRaster>>({})
  const [rasterStyles, setRasterStyles] = useState<Record<string, RasterStyle>>({})
  const canvasElementRefs = useRef<Record<string, HTMLCanvasElement | null>>({})
  const { getMap, isLeafletLoaded } = useMap()

  const loadRaster = useCallback(
    async (rasterId: string, filePathOrWms?: string, wmsLayerName?: string) => {
      console.log(`[v0] Loading raster: ${rasterId}, WMS Layer: ${wmsLayerName}`)

      if (!filePathOrWms) {
        console.error(`[useRaster] filePathOrWms is undefined for rasterId: ${rasterId}`)
        alert(`Raster load failed for ${rasterId}: filePathOrWms is undefined`)
        return
      }
      const map = getMap()
      if (!map || !isLeafletLoaded) {
        console.warn("[useRaster] Map not ready for raster operations. Aborting loadRaster.")
        return
      }

      // Remove if already active
      if (activeRasters.has(rasterId)) {
        if (loadedRasters[rasterId]) {
          map.removeLayer(loadedRasters[rasterId].layer)
          if (canvasElementRefs.current[rasterId]) {
            canvasElementRefs.current[rasterId]!.style.filter = ""
          }
          setLoadedRasters((prev) => {
            const newRasters = { ...prev }
            delete newRasters[rasterId]
            return newRasters
          })
          delete canvasElementRefs.current[rasterId]
        }
        setActiveRasters((prev) => {
          const newSet = new Set(prev)
          newSet.delete(rasterId)
          return newSet
        })
        setRasterStyles((prev) => {
          const newStyles = { ...prev }
          delete newStyles[rasterId]
          return newStyles
        })
        return
      }

      setLoadingRasters((prev) => new Set(prev).add(rasterId))

      try {
        let layer: any = null
        const initialStyle = { opacity: 0.7, contrast: 1 }

        if (filePathOrWms.startsWith("http") && wmsLayerName) {
          // --- WMS Raster Layer ---
          layer = window.L.tileLayer.wms(filePathOrWms, {
            layers: wmsLayerName,
            format: "image/png",
            transparent: true,
            opacity: initialStyle.opacity,
          })
          layer.addTo(map)
          layer.bringToFront?.()

          // --- Zoom to raster using BBOX_API ---
          try {
            console.log(`[v0] Fetching bbox for layer: ${wmsLayerName}`)
            const bboxRes = await fetch(`${BBOX_API}?layer=${encodeURIComponent(wmsLayerName)}`)
            if (bboxRes.ok) {
              const bboxJson = await bboxRes.json()
              console.log(`[v0] BBOX response:`, bboxJson)
              const info = bboxJson[wmsLayerName]
              if (info && (info.default_bbox || (info.minx !== undefined && info.miny !== undefined))) {
                const b = info.default_bbox || info // Handle both API response formats
                console.log(`[v0] Zooming to bounds:`, b)
                // [southWest, northEast] in [lat, lon]
                const bounds = [
                  [b.miny, b.minx],
                  [b.maxy, b.maxx],
                ]
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 })
                setTimeout(() => map.invalidateSize(), 300)
              } else {
                console.warn(`[v0] No bbox info found for layer: ${wmsLayerName}`)
              }
            } else {
              console.error(`[v0] BBOX API failed with status: ${bboxRes.status}`)
            }
          } catch (bboxErr) {
            console.error(`[useRaster] Failed to zoom to raster bbox for ${wmsLayerName}:`, bboxErr)
          }
        }
        // Removed local raster logic for mouza layers

        setLoadedRasters((prev) => ({
          ...prev,
          [rasterId]: { layer, style: initialStyle, layerName: wmsLayerName },
        }))
        setRasterStyles((prev) => ({
          ...prev,
          [rasterId]: initialStyle,
        }))
        setActiveRasters((prev) => {
          const newSet = new Set(prev).add(rasterId)
          return newSet
        })
      } catch (error) {
        console.error(`[useRaster] Failed to load raster ${rasterId}:`, error)
        alert(`Raster load failed for ${rasterId}: ${error}`)
      } finally {
        setLoadingRasters((prev) => {
          const newSet = new Set(prev)
          newSet.delete(rasterId)
          return newSet
        })
      }
    },
    [getMap, isLeafletLoaded, activeRasters, loadedRasters],
  )

  const updateRasterStyle = useCallback(
    (rasterId: string, style: Partial<RasterStyle>) => {
      setRasterStyles((prev) => ({
        ...prev,
        [rasterId]: { ...prev[rasterId], ...style },
      }))

      if (loadedRasters[rasterId]) {
        const rasterData = loadedRasters[rasterId]
        const layer = rasterData.layer

        if (style.opacity !== undefined) {
          layer.setOpacity(style.opacity)
        }

        if (style.contrast !== undefined) {
          let applied = false
          const targetCanvas = canvasElementRefs.current[rasterId]
          if (targetCanvas) {
            targetCanvas.style.filter = `contrast(${style.contrast})`
            applied = true
          } else {
            const mapContainer = layer._map && layer._map.getContainer && layer._map.getContainer()
            if (mapContainer) {
              const canvases = mapContainer.querySelectorAll("canvas")
              canvases.forEach((c: any) => {
                c.style.filter = `contrast(${style.contrast})`
                applied = true
              })
            }
            setTimeout(() => {
              const reFoundCanvas = layer.getCanvas && layer.getCanvas()
              if (reFoundCanvas) {
                reFoundCanvas.style.filter = `contrast(${style.contrast})`
                canvasElementRefs.current[rasterId] = reFoundCanvas
              }
            }, 100)
          }
        }

        setLoadedRasters((prev) => ({
          ...prev,
          [rasterId]: {
            ...prev[rasterId],
            style: { ...prev[rasterId].style, ...style },
          },
        }))
      }
    },
    [loadedRasters],
  )

  const isRasterActive = useCallback(
    (rasterId: string) => {
      return activeRasters.has(rasterId)
    },
    [activeRasters],
  )

  const isRasterLoading = useCallback(
    (rasterId: string) => {
      return loadingRasters.has(rasterId)
    },
    [loadingRasters],
  )

  const getRasterStyle = useCallback(
    (rasterId: string) => {
      return rasterStyles[rasterId] || { opacity: 0.7, contrast: 1 }
    },
    [rasterStyles],
  )

  const zoomToRaster = useCallback(
    async (layerId: string) => {
      const map = getMap()
      if (!map) return

      // Get the actual WMS layer name from stored raster data
      const loadedRaster = loadedRasters[layerId]
      const actualLayerName = loadedRaster?.layerName || layerId

      console.log(`[v0] Zooming to raster - layerId: ${layerId}, actualLayerName: ${actualLayerName}`)

      try {
        const bboxRes = await fetch(`${BBOX_API}?layer=${encodeURIComponent(actualLayerName)}`)
        if (bboxRes.ok) {
          const bboxJson = await bboxRes.json()
          console.log(`[v0] Zoom BBOX response:`, bboxJson)
          const info = bboxJson[actualLayerName]
          if (info && (info.default_bbox || (info.minx !== undefined && info.miny !== undefined))) {
            const b = info.default_bbox || info // Handle both API response formats
            console.log(`[v0] Zooming to bounds:`, b)
            const bounds = [
              [b.miny, b.minx],
              [b.maxy, b.maxx],
            ]
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 })
            setTimeout(() => map.invalidateSize(), 300)
          } else {
            console.warn(`[v0] No bbox info found for layer: ${actualLayerName}`)
          }
        } else {
          console.error(`[v0] BBOX API failed with status: ${bboxRes.status}`)
        }
      } catch (err) {
        console.error(`[useRaster] Failed to zoom to raster bbox for ${actualLayerName}:`, err)
      }
    },
    [getMap, loadedRasters],
  )

  return {
    loadRaster,
    updateRasterStyle,
    isRasterActive,
    isRasterLoading,
    getRasterStyle,
    rasterStyles,
    loadedRasters,
    activeRasters,
    zoomToRaster,
  }
}
