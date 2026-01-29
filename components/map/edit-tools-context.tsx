"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { useMap } from "@/hooks/use-map"
import type { DrawnShape } from "@/lib/types/shape"
import { saveShapesToStorage, loadShapesFromStorage, exportShapesToJSON } from "@/lib/utils/shape-storage"
import { exportToGeoJSON, exportToKMZ } from "@/lib/utils/export-utils"
import { ShapeInfoPopup } from "@/components/map/shape-info-popup"
import { PolygonDetailsModal } from "@/components/map/polygon-details-modal"

interface EditToolsContextType {
    activeEditTool: string | null
    setActiveEditTool: (tool: string | null) => void
    drawnShapes: DrawnShape[]
    setDrawnShapes: React.Dispatch<React.SetStateAction<DrawnShape[]>>
    selectedShape: DrawnShape | null
    setSelectedShape: (shape: DrawnShape | null) => void
    showDetailsPopup: boolean
    setShowDetailsPopup: (show: boolean) => void
    draftingShape: DrawnShape | null
    setDraftingShape: (shape: DrawnShape | null) => void
    hiddenShapes: Set<string>
    setHiddenShapes: React.Dispatch<React.SetStateAction<Set<string>>>
    visibleTypes: Set<string>
    toggleTypeVisibility: (type: string) => void

    // Popup state
    showShapeInfoPopup: boolean
    setShowShapeInfoPopup: (show: boolean) => void
    clickedShape: DrawnShape | null
    setClickedShape: (shape: DrawnShape | null) => void

    // Undo/Redo
    canUndo: boolean
    canRedo: boolean
    undoPolygonPoint: () => void
    redoPolygonPoint: () => void

    // Operations
    deleteShape: (id: string) => void
    deleteAllShapes: () => void
    toggleShapeVisibility: (id: string) => void
    saveShapes: () => void
    exportShapes: () => void
    exportShapesAsGeoJSON: () => void
    exportShapesAsKMZ: () => void
    exportShapesAsDatabase: () => void
    exportSingleShape: (id: string, format?: string) => void
    importShapes: () => void
    importShapesFromGeoJSON: () => void
    updateShapeDetails: (id: string, details: any) => void
    updateShapeColor: (id: string, color: string) => void
    zoomToShape: (id: string) => void
    getShapeById: (id: string) => DrawnShape | undefined
    precisionMode: boolean
    setPrecisionMode: (mode: boolean) => void
    startEditingGeometry: (id: string) => void
    startEditingDetails: (id: string) => void

    // Drawing tools toggle
    isDrawingEnabled: boolean
    setIsDrawingEnabled: (enabled: boolean) => void

    // Editing
    saveEditedPolygon: () => void
}

const EditToolsContext = createContext<EditToolsContextType | undefined>(undefined)

export function EditToolsProvider({ children }: { children: React.ReactNode }) {
    const [activeEditTool, setActiveEditToolState] = useState<string | null>(null)
    const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([])
    const [hiddenShapes, setHiddenShapes] = useState<Set<string>>(new Set())
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
    const selectedShape = React.useMemo(() =>
        selectedShapeId ? drawnShapes.find(s => s.id === selectedShapeId) || null : null
        , [selectedShapeId, drawnShapes])

    const setSelectedShape = (shape: DrawnShape | null) => {
        setSelectedShapeId(shape?.id || null)
    }
    const [showDetailsPopup, setShowDetailsPopup] = useState(false)
    const [draftingShape, setDraftingShape] = useState<DrawnShape | null>(null)
    const [selectedPolygon, setSelectedPolygon] = useState<DrawnShape | null>(null)
    const [precisionMode, setPrecisionMode] = useState(false)
    const [showShapeInfoPopup, setShowShapeInfoPopup] = useState(false)
    const [clickedShapeId, setClickedShapeId] = useState<string | null>(null)
    const clickedShape = React.useMemo(() =>
        clickedShapeId ? drawnShapes.find(s => s.id === clickedShapeId) || null : null
        , [clickedShapeId, drawnShapes])

    const setClickedShape = (shape: DrawnShape | null) => {
        setClickedShapeId(shape?.id || null)
    }
    const [isDrawingEnabled, setIsDrawingEnabled] = useState(true)
    const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(['polygon', 'circle']))

    // Undo/Redo Stacks
    const [undoStack, setUndoStack] = useState<any[][]>([])
    const [redoStack, setRedoStack] = useState<any[][]>([])

    const { getMap, isLeafletLoaded } = useMap()
    const drawingLayerRef = useRef<any>(null)
    const editingRef = useRef<boolean>(false)
    const shapeLayersRef = useRef<Map<string, any>>(new Map())
    const cleanupFunctionRef = useRef<(() => void) | null>(null)

    // Polygon Refs
    const pointsRef = useRef<any[]>([])
    const polygonStartedRef = useRef(false)
    const currentShapeRef = useRef<any>(null)
    const guideLineRef = useRef<any>(null)
    const vertexMarkersRef = useRef<any[]>([])
    const lastPolygonIndexRef = useRef(0)

    // Circle Refs
    const circleStartedRef = useRef(false)
    const circleCenterRef = useRef<any>(null)
    const circleRadiusRef = useRef<number>(0)
    const lastCircleIndexRef = useRef(0)

    // ... (Notification and stats logic moved here or imported)
    const showNotification = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
        // Basic browser notification as fallback or existing UI implementation
        console.log(`[Notification] ${type}: ${message}`)
    }, [])

    const calculatePolygonStats = useCallback((coordinates: any[]) => {
        if (!coordinates || coordinates.length < 3) return { area: 0, perimeter: 0, vertices: coordinates?.length || 0 }

        // Perimeter Calculation (Haversine-ish or L.latLng().distanceTo)
        let perimeter = 0
        for (let i = 0; i < coordinates.length; i++) {
            const p1 = coordinates[i]
            const p2 = coordinates[(i + 1) % coordinates.length]
            // Use Leaflet distanceTo if available (coordinates are LatLng objects or {lat, lng})
            // Assuming coordinates are {lat, lng} like Leaflet LatLng
            // We can re-instantiate L.latLng to be sure if window.L is available
            if (window.L) {
                perimeter += window.L.latLng(p1).distanceTo(p2)
            }
        }

        // Area Calculation (Shoelace formula on projected coordinates or approximate)
        // For accurate geodesic area, we need a library or complex formula. 
        // We'll use a spherical approximation.
        const earthRadius = 6378137 // meters
        let area = 0
        if (coordinates.length > 2) {
            for (let i = 0; i < coordinates.length; i++) {
                const p1 = coordinates[i]
                const p2 = coordinates[(i + 1) % coordinates.length]
                const x1 = (p1.lng * Math.PI) / 180
                const y1 = (p1.lat * Math.PI) / 180
                const x2 = (p2.lng * Math.PI) / 180
                const y2 = (p2.lat * Math.PI) / 180
                area += (x2 - x1) * (2 + Math.sin(y1) + Math.sin(y2))
            }
            area = (Math.abs(area) * earthRadius * earthRadius) / 2
        }

        return { area, perimeter, vertices: coordinates.length }
    }, [])

    const getCentroid = useCallback((coordinates: any[]) => {
        if (!coordinates || coordinates.length === 0) return null
        let lat = 0, lng = 0
        coordinates.forEach(c => { lat += c.lat; lng += c.lng })
        return { lat: lat / coordinates.length, lng: lng / coordinates.length }
    }, [])

    const addShapeToMap = useCallback((shape: DrawnShape) => {
        const map = getMap()
        if (!map || !window.L || !drawingLayerRef.current) return
        const L = window.L
        let layer: any
        if (shape.type === "polygon") {
            layer = L.polygon(shape.coordinates, {
                ...shape.style,
                pane: 'overlayPane' // Ensure it's above tile layers
            }).addTo(drawingLayerRef.current)
            layer.bindTooltip(`${shape.name} (${shape.area ? Math.round(shape.area) + ' m²' : ''})`, {
                sticky: true,
                direction: 'top'
            })
            shapeLayersRef.current.set(shape.id, layer)

            // Fix click handler
            layer.on('click', (e: any) => {
                L.DomEvent.preventDefault(e)
                L.DomEvent.stopPropagation(e)
                console.log('[ShapeClick] Clicked polygon:', shape.id)
                setClickedShape(shape)
                setShowShapeInfoPopup(true)
            })

            // Bring to front
            layer.bringToFront()

        } else if (shape.type === "circle" && shape.radius) {
            const center = shape.coordinates[0]
            layer = L.circle([center[0], center[1]], {
                radius: shape.radius,
                ...shape.style,
                pane: 'overlayPane' // Ensure it's above tile layers
            }).addTo(drawingLayerRef.current)
            layer.bindTooltip(`${shape.name} (R: ${shape.radius ? Math.round(shape.radius) + ' m' : ''})`, {
                sticky: true,
                direction: 'top'
            })
            shapeLayersRef.current.set(shape.id, layer)

            // Fix click handler
            layer.on('click', (e: any) => {
                L.DomEvent.preventDefault(e)
                L.DomEvent.stopPropagation(e)
                console.log('[ShapeClick] Clicked circle:', shape.id)
                setClickedShape(shape)
                setShowShapeInfoPopup(true)
            })

            // Bring to front
            layer.bringToFront()
        }

        // Hide if type is not visible
        if (!visibleTypes.has(shape.type)) {
            map.removeLayer(layer)
        }
    }, [getMap, visibleTypes])

    const initializeDrawingLayer = useCallback(() => {
        const map = getMap()
        if (!map || !isLeafletLoaded || drawingLayerRef.current) return
        const L = window.L
        drawingLayerRef.current = L.layerGroup().addTo(map)
        const saved = loadShapesFromStorage()
        setDrawnShapes(saved)
        saved.forEach(addShapeToMap)
    }, [getMap, isLeafletLoaded, addShapeToMap])

    // Initialize drawing layer when map is ready
    useEffect(() => {
        if (isLeafletLoaded && !drawingLayerRef.current) {
            initializeDrawingLayer()
        }
    }, [isLeafletLoaded, initializeDrawingLayer])

    // Auto-save shapes whenever they change
    useEffect(() => {
        if (drawnShapes.length > 0) {
            saveShapesToStorage(drawnShapes)
            console.log('[EditTools] Auto-saved', drawnShapes.length, 'shapes')
        }
    }, [drawnShapes])

    // --- EDITING LOGIC ---
    useEffect(() => {
        const map = getMap()
        if (!map || !window.L || activeEditTool !== "edit-polygon" || !selectedShape) return

        const L = window.L
        const shapeId = selectedShape.id
        const layer = shapeLayersRef.current.get(shapeId)

        if (!layer) return

        // Create edit markers for vertices
        const editMarkers: any[] = []
        const coords = [...selectedShape.coordinates]

        // Hide original layer temporarily or style it differently
        layer.setStyle({ opacity: 0.5, dashArray: '5, 5' })

        // Helper to update polygon during drag
        const updatePolygonPreview = () => {
            const newCoords = editMarkers.map(m => m.getLatLng())
            layer.setLatLngs(newCoords)
        }

        coords.forEach((coord: any, index: number) => {
            const marker = L.marker([coord[0], coord[1]], {
                draggable: true,
                icon: L.divIcon({
                    className: 'vertex-edit-marker',
                    html: `<div style="width: 12px; height: 12px; background: white; border: 2px solid #3B82F6; border-radius: 50%; cursor: move;"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                })
            }).addTo(map)

            marker.on('drag', () => {
                updatePolygonPreview()
            })

            editMarkers.push(marker)
        })

        // Cleanup function for edit mode
        cleanupFunctionRef.current = () => {
            // Restore original style
            if (layer) {
                layer.setStyle(selectedShape.style || { color: "#3B82F6", weight: 3 })
            }

            // Remove markers
            editMarkers.forEach(m => map.removeLayer(m))

            // If we are exiting edit mode (saving changes would handle state update elsewhere)
            // This is just cleanup of visual elements
        }

    }, [activeEditTool, selectedShape, getMap])


    // --- DRAWING LOGIC ---
    const startDrawingPolygon = useCallback(() => {
        const map = getMap()
        if (!map || !window.L || !drawingLayerRef.current) return
        const L = window.L

        // Add custom cursor
        map.getContainer().classList.add('drawing-cursor-polygon')

        // Reset refs
        polygonStartedRef.current = false
        pointsRef.current = []
        vertexMarkersRef.current = []
        setUndoStack([])
        setRedoStack([])

        const onMapClick = (e: any) => {
            setUndoStack(prev => [...prev, [...pointsRef.current]])
            setRedoStack([]) // Clear redo on new action

            if (!polygonStartedRef.current) {
                polygonStartedRef.current = true
                pointsRef.current = [e.latlng]
                currentShapeRef.current = L.polygon(pointsRef.current, {
                    color: "#3B82F6",
                    fillColor: "#3B82F6",
                    fillOpacity: 0.2,
                    weight: 3
                }).addTo(map)

                // Create guide line
                guideLineRef.current = L.polyline([], {
                    color: "#3B82F6",
                    weight: 2,
                    dashArray: "5, 5",
                    opacity: 0.7
                }).addTo(map)
            } else {
                pointsRef.current.push(e.latlng)
                currentShapeRef.current.setLatLngs(pointsRef.current)

                // Add vertex marker
                const marker = L.circleMarker(e.latlng, {
                    radius: 5,
                    fillColor: "#3B82F6",
                    color: "white",
                    weight: 2,
                    fillOpacity: 1
                }).addTo(map)
                vertexMarkersRef.current.push(marker)
            }
        }

        const onMapMouseMove = (e: any) => {
            if (polygonStartedRef.current && pointsRef.current.length > 0 && guideLineRef.current) {
                const lastPoint = pointsRef.current[pointsRef.current.length - 1]
                guideLineRef.current.setLatLngs([lastPoint, e.latlng])

                // Measurement Tooltip
                const distance = lastPoint.distanceTo(e.latlng)
                const distanceStr = distance > 1000
                    ? `${(distance / 1000).toFixed(2)} km`
                    : `${Math.round(distance)} m`

                if (!guideLineRef.current.getTooltip()) {
                    guideLineRef.current.bindTooltip(distanceStr, {
                        permanent: true,
                        direction: 'right',
                        className: 'measurement-tooltip'
                    }).openTooltip()
                } else {
                    guideLineRef.current.setTooltipContent(distanceStr)
                }
            }
        }

        const onMapDblClick = (e: any) => {
            if (!polygonStartedRef.current || pointsRef.current.length < 3) return

            // Remove the last point if it was added by the double-click
            const coords = [...pointsRef.current]

            // Generate unique ID
            const polygonId = `polygon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            // Calculate stats
            const stats = calculatePolygonStats(coords)

            // Create new shape object
            const newShape: DrawnShape = {
                id: polygonId,
                name: `Polygon ${lastPolygonIndexRef.current + 1}`,
                type: "polygon",
                coordinates: coords.map(c => [c.lat, c.lng]),
                style: {
                    color: "#3B82F6",
                    fillColor: "#3B82F6",
                    fillOpacity: 0.2,
                    weight: 3
                },
                area: stats.area,
                perimeter: stats.perimeter,
                vertices: stats.vertices,
                createdAt: new Date().toISOString()
            }

            // Add to state and auto-save
            setDrawnShapes(prev => {
                const updated = [...prev, newShape]
                saveShapesToStorage(updated)
                return updated
            })
            lastPolygonIndexRef.current += 1

            // Remove temporary drawing layer
            if (currentShapeRef.current) {
                map.removeLayer(currentShapeRef.current)
            }
            if (guideLineRef.current) {
                map.removeLayer(guideLineRef.current)
            }
            // Remove vertex markers
            vertexMarkersRef.current.forEach(marker => map.removeLayer(marker))
            vertexMarkersRef.current = []

            // Add permanent layer
            const permanentLayer = L.polygon(coords, newShape.style).addTo(drawingLayerRef.current)
            shapeLayersRef.current.set(polygonId, permanentLayer)

            // Reset
            polygonStartedRef.current = false
            pointsRef.current = []
            currentShapeRef.current = null
            guideLineRef.current = null

            showNotification(`Polygon created with ${stats.vertices} vertices`, "success")

            // Turn off drawing mode
            setActiveEditToolState(null)
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && polygonStartedRef.current) {
                // Cancel drawing
                if (currentShapeRef.current) map.removeLayer(currentShapeRef.current)
                if (guideLineRef.current) map.removeLayer(guideLineRef.current)
                polygonStartedRef.current = false
                pointsRef.current = []
                currentShapeRef.current = null
                guideLineRef.current = null
                setActiveEditToolState(null)
                showNotification("Polygon drawing cancelled", "info")
            }
        }

        map.on("click", onMapClick)
        map.on("mousemove", onMapMouseMove)
        map.on("dblclick", onMapDblClick)
        document.addEventListener("keydown", onKeyDown)

        cleanupFunctionRef.current = () => {
            map.off("click", onMapClick)
            map.off("mousemove", onMapMouseMove)
            map.off("dblclick", onMapDblClick)
            document.removeEventListener("keydown", onKeyDown)
            if (currentShapeRef.current) map.removeLayer(currentShapeRef.current)
            if (guideLineRef.current) map.removeLayer(guideLineRef.current)
            vertexMarkersRef.current.forEach(marker => map.removeLayer(marker))
            vertexMarkersRef.current = []
            polygonStartedRef.current = false
            pointsRef.current = []
            currentShapeRef.current = null
            guideLineRef.current = null
            // Remove custom cursor
            map.getContainer().classList.remove('drawing-cursor-polygon')
        }
    }, [getMap, calculatePolygonStats, showNotification])

    const startDrawingCircle = useCallback(() => {
        const map = getMap()
        if (!map || !window.L || !drawingLayerRef.current) return
        const L = window.L

        // Add custom cursor
        map.getContainer().classList.add('drawing-cursor-circle')

        // Reset refs
        circleStartedRef.current = false
        circleCenterRef.current = null
        circleRadiusRef.current = 0

        const onMapClick = (e: any) => {
            if (!circleStartedRef.current) {
                // First click - set center
                circleStartedRef.current = true
                circleCenterRef.current = e.latlng
                currentShapeRef.current = L.circle(e.latlng, {
                    radius: 10,
                    color: "#10B981",
                    fillColor: "#10B981",
                    fillOpacity: 0.2,
                    weight: 3
                }).addTo(map)
            } else {
                // Second click - finish circle
                const center = circleCenterRef.current
                const radius = center.distanceTo(e.latlng)

                // Generate unique ID
                const circleId = `circle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

                // Calculate area
                const area = Math.PI * radius * radius

                // Create new shape object
                const newShape: DrawnShape = {
                    id: circleId,
                    name: `Circle ${lastCircleIndexRef.current + 1}`,
                    type: "circle",
                    coordinates: [[center.lat, center.lng]],
                    radius: radius,
                    style: {
                        color: "#10B981",
                        fillColor: "#10B981",
                        fillOpacity: 0.2,
                        weight: 3
                    },
                    area: area,
                    createdAt: new Date().toISOString()
                }

                // Add to state and auto-save
                setDrawnShapes(prev => {
                    const updated = [...prev, newShape]
                    saveShapesToStorage(updated)
                    return updated
                })
                lastCircleIndexRef.current += 1

                // Remove temporary drawing layer
                if (currentShapeRef.current) {
                    map.removeLayer(currentShapeRef.current)
                }

                // Add permanent layer
                const permanentLayer = L.circle(center, {
                    radius: radius,
                    ...newShape.style
                }).addTo(drawingLayerRef.current)
                shapeLayersRef.current.set(circleId, permanentLayer)

                // Reset
                circleStartedRef.current = false
                circleCenterRef.current = null
                circleRadiusRef.current = 0
                currentShapeRef.current = null

                showNotification(`Circle created with radius ${radius.toFixed(2)}m`, "success")

                // Turn off drawing mode
                setActiveEditToolState(null)
            }
        }

        const onMapMouseMove = (e: any) => {
            if (circleStartedRef.current && circleCenterRef.current && currentShapeRef.current) {
                const radius = circleCenterRef.current.distanceTo(e.latlng)
                circleRadiusRef.current = radius
                currentShapeRef.current.setRadius(radius)

                // Measurement Tooltip
                const radiusStr = `R: ${radius > 1000 ? (radius / 1000).toFixed(2) + ' km' : Math.round(radius) + ' m'}`
                if (!currentShapeRef.current.getTooltip()) {
                    currentShapeRef.current.bindTooltip(radiusStr, {
                        permanent: true,
                        direction: 'right',
                        className: 'measurement-tooltip'
                    }).openTooltip()
                } else {
                    currentShapeRef.current.setTooltipContent(radiusStr)
                }
            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && circleStartedRef.current) {
                // Cancel drawing
                if (currentShapeRef.current) map.removeLayer(currentShapeRef.current)
                circleStartedRef.current = false
                circleCenterRef.current = null
                circleRadiusRef.current = 0
                currentShapeRef.current = null
                setActiveEditToolState(null)
                showNotification("Circle drawing cancelled", "info")
            }
        }

        map.on("click", onMapClick)
        map.on("mousemove", onMapMouseMove)
        document.addEventListener("keydown", onKeyDown)

        cleanupFunctionRef.current = () => {
            map.off("click", onMapClick)
            map.off("mousemove", onMapMouseMove)
            document.removeEventListener("keydown", onKeyDown)
            if (currentShapeRef.current) map.removeLayer(currentShapeRef.current)
            circleStartedRef.current = false
            circleCenterRef.current = null
            circleRadiusRef.current = 0
            currentShapeRef.current = null
            // Remove custom cursor
            map.getContainer().classList.remove('drawing-cursor-circle')
        }
    }, [getMap, showNotification])

    // --- RESTORED HELPER FUNCTIONS ---

    const undoPolygonPoint = useCallback(() => {
        if (undoStack.length === 0) return
        const prevPoints = undoStack[undoStack.length - 1]
        setUndoStack(prev => prev.slice(0, -1))
        setRedoStack(prev => [...prev, pointsRef.current])
        pointsRef.current = prevPoints
        // Redraw
        if (currentShapeRef.current) {
            currentShapeRef.current.setLatLngs(prevPoints)
        }
    }, [undoStack])

    const redoPolygonPoint = useCallback(() => {
        if (redoStack.length === 0) return
        const nextPoints = redoStack[redoStack.length - 1]
        setRedoStack(prev => prev.slice(0, -1))
        setUndoStack(prev => [...prev, pointsRef.current])
        pointsRef.current = nextPoints
        if (currentShapeRef.current) {
            currentShapeRef.current.setLatLngs(nextPoints)
        }
    }, [redoStack])

    const deleteShape = useCallback((id: string) => {
        const map = getMap()
        if (map && shapeLayersRef.current.has(id)) {
            map.removeLayer(shapeLayersRef.current.get(id))
            shapeLayersRef.current.delete(id)
        }
        setDrawnShapes(prev => {
            const updated = prev.filter(s => s.id !== id)
            saveShapesToStorage(updated)
            return updated
        })
        if (selectedShape && selectedShape.id === id) setSelectedShape(null)
        if (clickedShape && clickedShape.id === id) setClickedShape(null)
        showNotification("Shape deleted", "success")
    }, [getMap, selectedShape, clickedShape, showNotification])

    const deleteAllShapes = useCallback(() => {
        const map = getMap()
        if (map) {
            drawnShapes.forEach(shape => {
                if (shapeLayersRef.current.has(shape.id)) {
                    map.removeLayer(shapeLayersRef.current.get(shape.id))
                }
            })
            shapeLayersRef.current.clear()
        }
        setDrawnShapes([])
        saveShapesToStorage([])
        setSelectedShape(null)
        setClickedShape(null)
        showNotification("All shapes deleted", "success")
    }, [getMap, drawnShapes, showNotification])

    const toggleShapeVisibility = useCallback((id: string) => {
        const map = getMap()
        const layer = shapeLayersRef.current.get(id)
        if (layer && map) {
            if (hiddenShapes.has(id)) {
                map.addLayer(layer)
                setHiddenShapes(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(id)
                    return newSet
                })
            } else {
                map.removeLayer(layer)
                setHiddenShapes(prev => {
                    const newSet = new Set(prev)
                    newSet.add(id)
                    return newSet
                })
            }
        }
    }, [getMap, hiddenShapes])

    const toggleTypeVisibility = useCallback((type: string) => {
        const map = getMap()
        if (!map) return

        setVisibleTypes(prev => {
            const newSet = new Set(prev)
            const isVisible = newSet.has(type)

            if (isVisible) {
                newSet.delete(type)
                // Hide all shapes of this type
                drawnShapes.forEach(shape => {
                    if (shape.type === type) {
                        const layer = shapeLayersRef.current.get(shape.id)
                        if (layer) map.removeLayer(layer)
                    }
                })
            } else {
                newSet.add(type)
                // Show all shapes of this type unless individually hidden
                drawnShapes.forEach(shape => {
                    if (shape.type === type && !hiddenShapes.has(shape.id)) {
                        const layer = shapeLayersRef.current.get(shape.id)
                        if (layer) map.addLayer(layer)
                    }
                })
            }
            return newSet
        })
    }, [getMap, drawnShapes, hiddenShapes])

    const saveShapes = useCallback(() => {
        saveShapesToStorage(drawnShapes)
        showNotification("Shapes saved", "success")
    }, [drawnShapes, showNotification])

    const exportShapes = useCallback(() => {
        const data = JSON.stringify(drawnShapes, null, 2)
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = "shapes.json"
        a.click()
    }, [drawnShapes])

    const exportShapesAsGeoJSON = useCallback(() => {
        const data = exportToGeoJSON(drawnShapes)
        const blob = new Blob([data], { type: "application/geo+json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = "shapes.geojson"
        a.click()
        showNotification("Exported as GeoJSON", "success")
    }, [drawnShapes, showNotification])

    const exportShapesAsKMZ = useCallback(() => {
        const data = exportToKMZ(drawnShapes)
        const blob = new Blob([data], { type: "application/vnd.google-earth.kml+xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = "shapes.kml"
        a.click()
        showNotification("Exported as KML", "success")
    }, [drawnShapes, showNotification])

    const exportShapesAsDatabase = useCallback(() => { }, [])

    // Updated exportSingleShape with format support
    const exportSingleShape = useCallback((id: string, format: string = 'json') => {
        const shape = drawnShapes.find(s => s.id === id)
        if (!shape) return

        let data: string = ""
        let filename = `${shape.name || "shape"}.${format.toLowerCase()}`
        let mimeType = "application/json"

        if (format === 'json') {
            data = JSON.stringify(shape, null, 2)
        } else if (format === 'geojson') {
            data = exportToGeoJSON([shape])
            filename = `${shape.name || "shape"}.geojson`
            mimeType = "application/geo+json"
        } else if (format === 'kml') {
            data = exportToKMZ([shape])
            filename = `${shape.name || "shape"}.kml`
            mimeType = "application/vnd.google-earth.kml+xml"
        }

        const blob = new Blob([data], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }, [drawnShapes])

    const importShapes = useCallback(() => { }, [])
    const importShapesFromGeoJSON = useCallback(() => { }, [])
    const updateShapeDetails = useCallback((id: string, details: any) => {
        setDrawnShapes(prev => {
            const updated = prev.map(s =>
                s.id === id ? { ...s, ...details } : s
            )
            saveShapesToStorage(updated)
            return updated
        })

        // Update the layer if it exists
        const layer = shapeLayersRef.current.get(id)
        if (layer && details.style) {
            layer.setStyle(details.style)
        }

        showNotification("Shape updated", "success")
    }, [showNotification])

    const updateShapeColor = useCallback((id: string, color: string) => {
        setDrawnShapes(prev => {
            const updated = prev.map(s => {
                if (s.id === id) {
                    return {
                        ...s,
                        style: {
                            ...s.style,
                            color: color,
                            fillColor: color
                        }
                    }
                }
                return s
            })
            saveShapesToStorage(updated)
            return updated
        })

        // Update the layer color
        const layer = shapeLayersRef.current.get(id)
        if (layer) {
            layer.setStyle({ color: color, fillColor: color })
        }

        showNotification("Color updated", "success")
    }, [showNotification])

    const zoomToShape = useCallback((id: string) => {
        const layer = shapeLayersRef.current.get(id)
        if (layer && getMap()) {
            getMap().fitBounds(layer.getBounds())
        }
    }, [getMap])

    const getShapeById = useCallback((id: string) => drawnShapes.find(s => s.id === id), [drawnShapes])



    const renamePolygon = useCallback((id: string, name: string) => {
        setDrawnShapes(prev => prev.map(s => s.id === id ? { ...s, name } : s))
    }, [])

    const startEditingGeometry = useCallback((id: string) => {
        const shape = drawnShapes.find(s => s.id === id)
        if (shape && shape.type === "polygon") {
            setSelectedShape(shape)
            setActiveEditTool("edit-polygon")
            showNotification("Editing geometry", "info")
        } else {
            showNotification("Only polygons support vertex editing currently", "info")
        }
    }, [drawnShapes, showNotification])

    const startEditingDetails = useCallback((id: string) => {
        const shape = drawnShapes.find(s => s.id === id)
        if (shape) {
            setSelectedShape(shape)
            setShowDetailsPopup(true)
            setShowShapeInfoPopup(false)
        }
    }, [drawnShapes])



    const setActiveEditTool = useCallback((tool: string | null) => {
        if (cleanupFunctionRef.current) {
            cleanupFunctionRef.current()
            cleanupFunctionRef.current = null
        }

        if (tool && !isDrawingEnabled) {
            showNotification("Drawing is disabled. Toggle 'Enable Drawing' to start.", "info")
            return
        }

        setActiveEditToolState(tool)

        if (tool === "polygon") {
            startDrawingPolygon()
        }
        else if (tool === "circle") {
            startDrawingCircle()
        }
    }, [startDrawingPolygon, startDrawingCircle])



    const saveEditedPolygon = useCallback(() => {
        const map = getMap()
        if (!map || !selectedShape || selectedShape.type !== 'polygon') return

        const layer = shapeLayersRef.current.get(selectedShape.id)
        if (!layer || typeof layer.getLatLngs !== 'function') {
            setActiveEditTool(null)
            setSelectedShape(null)
            return
        }

        let latLngs = layer.getLatLngs()
        // Leaflet returns nested arrays for polygons with holes or multi-polygons.
        // We handle simple polygons (LatLng[]) and single-ring polygons with holes (LatLng[][]).
        if (latLngs.length > 0 && Array.isArray(latLngs[0])) {
            latLngs = latLngs[0]
        }

        if (!Array.isArray(latLngs)) {
            showNotification("Could not retrieve polygon coordinates", "error")
            return
        }

        const newCoordinates = latLngs.map((ll: any) => [ll.lat, ll.lng])

        // Calculate new stats using the LatLng objects
        const stats = calculatePolygonStats(latLngs)

        setDrawnShapes(prev => {
            const updated = prev.map(s =>
                s.id === selectedShape.id
                    ? { ...s, coordinates: newCoordinates, area: stats.area, perimeter: stats.perimeter, vertices: stats.vertices }
                    : s
            )
            saveShapesToStorage(updated)
            return updated
        })

        setActiveEditTool(null)
        setSelectedShape(null)
        showNotification("Polygon saved successfully", "success")

    }, [getMap, selectedShape, calculatePolygonStats, showNotification, setActiveEditTool])

    return (
        <EditToolsContext.Provider
            value={{
                activeEditTool,
                setActiveEditTool,
                drawnShapes,
                setDrawnShapes,
                selectedShape,
                setSelectedShape,
                showDetailsPopup,
                setShowDetailsPopup,
                draftingShape,
                setDraftingShape,
                hiddenShapes,
                setHiddenShapes,
                showShapeInfoPopup,
                setShowShapeInfoPopup,
                clickedShape,
                setClickedShape,
                canUndo: undoStack.length > 0,
                canRedo: redoStack.length > 0,
                undoPolygonPoint,
                redoPolygonPoint,
                deleteShape,
                deleteAllShapes,
                toggleShapeVisibility,
                saveShapes,
                exportShapes,
                exportShapesAsGeoJSON,
                exportShapesAsKMZ,
                exportShapesAsDatabase,
                exportSingleShape,
                importShapes,
                importShapesFromGeoJSON,
                updateShapeDetails,
                updateShapeColor,
                zoomToShape,
                getShapeById,
                precisionMode,
                setPrecisionMode,
                startEditingGeometry,
                startEditingDetails,
                isDrawingEnabled,
                setIsDrawingEnabled,
                saveEditedPolygon,
                visibleTypes,
                toggleTypeVisibility,
            }}
        >
            {children}
            {showShapeInfoPopup && clickedShape && (
                <ShapeInfoPopup
                    shape={clickedShape}
                    onClose={() => {
                        setShowShapeInfoPopup(false)
                        setClickedShape(null)
                    }}
                    onDelete={deleteShape}
                    onZoom={zoomToShape}
                    onExport={exportSingleShape}
                    onEdit={startEditingGeometry}
                    onOpenDetails={startEditingDetails}
                />
            )}
            <PolygonDetailsModal />
        </EditToolsContext.Provider>
    )
}

export function useEditTools() {
    const context = useContext(EditToolsContext)
    if (!context) throw new Error("useEditTools must be used within an EditToolsProvider")
    return context
}
