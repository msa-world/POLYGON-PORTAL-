"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, MapPin, Ruler, Calendar, Tag, FileText, Palette, Navigation, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { DrawnShape } from "@/lib/types/shape"

interface ShapeDetailsPopupProps {
  shape: DrawnShape | null
  isOpen: boolean
  onClose: () => void
  onSave: (details: any) => void
}

const categories = [
  "Administrative",
  "Commercial",
  "Residential",
  "Industrial",
  "Educational",
  "Healthcare",
  "Transportation",
  "Recreation",
  "Agriculture",
  "Environmental",
  "Other",
]

const zones = ["ICT", "Zone I", "Zone II", "Zone III", "Zone IV", "Zone V"]

const colors = [
  { name: "Blue", value: "#3388ff" },
  { name: "Red", value: "#ff3333" },
  { name: "Green", value: "#33ff33" },
  { name: "Orange", value: "#ff6b35" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Yellow", value: "#fbbf24" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
]

export function ShapeDetailsPopup({ shape, isOpen, onClose, onSave }: ShapeDetailsPopupProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    notes: "",
    zone: "ICT",
    type: "",
    mouza: "",
    sector: "",
    society: "",
    landuse: "",
    ownership: "",
    color: "#3388ff",
  })

  useEffect(() => {
    if (shape) {
      setFormData({
        name: shape.name || "",
        description: shape.description || "",
        category: shape.properties?.category || "",
        notes: shape.properties?.notes || "",
        zone: shape.properties?.zone || "ICT",
        type: shape.properties?.type || "",
        mouza: shape.properties?.mouza || "",
        sector: shape.properties?.sector || "",
        society: shape.properties?.society || "",
        landuse: shape.properties?.landuse || "",
        ownership: shape.properties?.ownership || "",
        color: shape.style?.color || "#3388ff",
      })
    }
  }, [shape])

  useEffect(() => {
    if (!isOpen) return
    // focus close on open for accessibility
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      clearTimeout(t)
    }
  }, [isOpen, onClose])

  const handleSave = () => {
    if (!shape) return
    onSave({
      name: formData.name,
      description: formData.description,
      properties: {
        ...shape.properties,
        category: formData.category,
        notes: formData.notes,
        zone: formData.zone,
        type: formData.type,
        mouza: formData.mouza,
        sector: formData.sector,
        society: formData.society,
        landuse: formData.landuse,
        ownership: formData.ownership,
      },
      style: {
        ...shape.style,
        color: formData.color,
        fillColor: formData.color,
      },
      updatedAt: new Date().toISOString()
    })
  }

  const calculatePolygonStats = () => {
    if (!shape || !shape.coordinates || !Array.isArray(shape.coordinates)) {
      return { vertices: 0, perimeter: "0", area: "0", centroid: null as any }
    }
    const coords = shape.coordinates
    let perimeter = 0
    let area = 0
    for (let i = 0; i < coords.length; i++) {
      const current = coords[i]
      const next = coords[(i + 1) % coords.length]
      if (current?.lat && current?.lng && next?.lat && next?.lng) {
        const distance = getDistance(current.lat, current.lng, next.lat, next.lng)
        perimeter += distance
      }
    }
    if (coords.length >= 3) {
      let sum = 0
      for (let i = 0; i < coords.length; i++) {
        const current = coords[i]
        const next = coords[(i + 1) % coords.length]
        if (current?.lat && current?.lng && next?.lat && next?.lng) {
          sum += current.lng * next.lat - next.lng * current.lat
        }
      }
      area = Math.abs(sum) / 2
      area = area * 111000 * 111000
    }
    return {
      vertices: coords.length,
      perimeter: perimeter.toFixed(2),
      area: area.toFixed(2),
      centroid: getCentroid(coords),
    }
  }

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getCentroid = (coords: any[]) => {
    if (!coords || coords.length === 0) return null
    let lat = 0,
      lng = 0,
      valid = 0
    coords.forEach((c) => {
      if (c?.lat && c?.lng) {
        lat += c.lat
        lng += c.lng
        valid++
      }
    })
    if (!valid) return null
    return { lat: (lat / valid).toFixed(6), lng: (lng / valid).toFixed(6) }
  }

  if (!shape) return null
  const stats = calculatePolygonStats()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[3000]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shape-details-title"
            aria-describedby="shape-details-desc"
            ref={dialogRef}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 right-0 h-full w-[350px] z-[3100] overflow-y-auto bg-gray-900 text-white shadow-xl"
          >

            <Card className="bg-white shadow-2xl border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg" aria-hidden="true">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle id="shape-details-title" className="text-xl">
                        {shape.name || 'Shape Details'} ({shape.type === 'polygon' ? 'Polygon' : 'Circle'})
                      </CardTitle>
                      <p id="shape-details-desc" className="text-sm text-gray-500 mt-1">
                        Created {new Date(shape.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/polygons/${shape.id}/edit`}
                      className="inline-flex items-center text-sm px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Full Edit Page
                    </Link>
                    <Button ref={closeBtnRef} variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.name}
                        onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                        placeholder="Polygon name"
                      />
                    </div>

                    {/* Zone as free text */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.zone}
                        onChange={e => setFormData(f => ({ ...f, zone: e.target.value }))}
                        placeholder="Zone (e.g. ICT, Zone I, ...)"
                      />
                    </div>

                    {/* Category as free text */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.category}
                        onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                        placeholder="Category (e.g. Residential, Commercial, ...)"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.type}
                        onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                        placeholder="Type (e.g. Residential, Commercial, ...)"
                      />
                    </div>

                    {/* Mouza */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Mouza</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.mouza}
                        onChange={e => setFormData(f => ({ ...f, mouza: e.target.value }))}
                        placeholder="Mouza name"
                      />
                    </div>

                    {/* Sector */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sector</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.sector}
                        onChange={e => setFormData(f => ({ ...f, sector: e.target.value }))}
                        placeholder="Sector name"
                      />
                    </div>

                    {/* Society */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Society</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.society}
                        onChange={e => setFormData(f => ({ ...f, society: e.target.value }))}
                        placeholder="Society name"
                      />
                    </div>

                    {/* Land Use */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Land Use</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.landuse}
                        onChange={e => setFormData(f => ({ ...f, landuse: e.target.value }))}
                        placeholder="Land use type"
                      />
                    </div>

                    {/* Ownership */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Ownership</label>
                      <input
                        type="text"
                        className="w-full rounded-md border px-2 py-1 text-sm"
                        value={formData.ownership}
                        onChange={e => setFormData(f => ({ ...f, ownership: e.target.value }))}
                        placeholder="Ownership type"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Polygon Statistics */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Ruler className="h-4 w-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Polygon Statistics</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">Vertices</div>
                      <div className="text-lg font-bold text-blue-800">{stats.vertices}</div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">Area</div>
                      <div className="text-lg font-bold text-green-800">
                        {(Number.parseFloat(stats.area) / 1000000).toFixed(3)} km²
                      </div>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-purple-600 font-medium">Perimeter</div>
                      <div className="text-lg font-bold text-purple-800">
                        {(Number.parseFloat(stats.perimeter) / 1000).toFixed(2)} km
                      </div>
                    </div>

                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-sm text-orange-600 font-medium">Zone</div>
                      <div className="text-lg font-bold text-orange-800">{formData.zone}</div>
                    </div>
                  </div>

                  {stats.centroid && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Navigation className="h-4 w-4 text-gray-600" />
                        <div className="text-sm text-gray-600 font-medium">Location (Centroid)</div>
                      </div>
                      <div className="text-sm font-mono text-gray-800">Latitude: {stats.centroid.lat}°N</div>
                      <div className="text-sm font-mono text-gray-800">Longitude: {stats.centroid.lng}°E</div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Styling */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Palette className="h-4 w-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Styling</h3>
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.value
                            ? "border-gray-800 scale-110"
                            : "border-gray-300 hover:border-gray-500"
                            }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setFormData((p) => ({ ...p, color: color.value }))}
                          title={color.name}
                          aria-label={`Choose ${color.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Notes */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="h-4 w-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Additional Notes</h3>
                  </div>

                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Add any additional notes or comments"
                    rows={3}
                  />
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Metadata</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium">{new Date(shape.createdAt).toLocaleString()}</div>
                    </div>

                    {shape.updatedAt && (
                      <div>
                        <span className="text-gray-600">Last Updated:</span>
                        <div className="font-medium">{new Date(shape.updatedAt).toLocaleString()}</div>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-600">Shape ID:</span>
                      <div className="font-mono text-xs">{shape.id}</div>
                    </div>

                    <div>
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline" className="ml-2">
                        Polygon
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleSave();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
