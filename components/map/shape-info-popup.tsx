"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Maximize2, Trash2, Download, ZoomIn, Edit3, Palette, FileText, Tag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DrawnShape } from "@/lib/types/shape"

interface ShapeInfoPopupProps {
    shape: DrawnShape | null
    onClose: () => void
    onDelete: (id: string) => void
    onZoom: (id: string) => void
    onExport: (id: string, format?: string) => void
    onEdit?: (id: string) => void
    onOpenDetails?: (id: string) => void
}

export function ShapeInfoPopup({ shape, onClose, onDelete, onZoom, onExport, onEdit, onOpenDetails }: ShapeInfoPopupProps) {
    if (!shape) return null

    // Calculate area display
    const areaM2 = shape.area || 0
    const areaAcres = (areaM2 / 4046.86).toFixed(2)

    // Format coordinates
    const formatCoord = (coord: number) => coord.toFixed(6)

    const [showExport, setShowExport] = React.useState(false)

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Popup Content - Mobile bottom sheet, Desktop centered */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="relative w-full sm:w-auto sm:min-w-[300px] sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[80vh] flex flex-col"
                >
                    {/* Header - Compact */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-white flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    {shape.type === "polygon" ? (
                                        <Maximize2 className="w-4 h-4" />
                                    ) : (
                                        <MapPin className="w-4 h-4" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold leading-tight">{shape.name || `${shape.type === "polygon" ? "Polygon" : "Circle"}`}</h3>
                                    <p className="text-xs text-blue-100">{shape.type === "polygon" ? "Polygon Shape" : "Circle Shape"}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                                onClick={onClose}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="p-4 space-y-3 overflow-y-auto flex-1">
                        {/* Statistics Grid - Compact */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                                    <p className="text-xs font-medium text-gray-600">Area</p>
                                </div>
                                <p className="text-lg font-bold text-blue-600">{areaM2.toLocaleString()} m²</p>
                                <p className="text-xs text-gray-500">{areaAcres} acres</p>
                            </div>

                            {shape.type === "polygon" && (
                                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-green-600" />
                                        <p className="text-xs font-medium text-gray-600">Perimeter</p>
                                    </div>
                                    <p className="text-lg font-bold text-green-600">{(shape.perimeter || 0).toLocaleString()} m</p>
                                    <p className="text-xs text-gray-500">{shape.vertices || 0} vertices</p>
                                </div>
                            )}

                            {shape.type === "circle" && shape.radius && (
                                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-green-600" />
                                        <p className="text-xs font-medium text-gray-600">Radius</p>
                                    </div>
                                    <p className="text-lg font-bold text-green-600">{shape.radius.toFixed(2)} m</p>
                                    <p className="text-xs text-gray-500">{(2 * Math.PI * shape.radius).toFixed(0)}m circum.</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {shape.description && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <h4 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    Description
                                </h4>
                                <p className="text-xs text-gray-600 italic">"{shape.description}"</p>
                            </div>
                        )}

                        {/* Metadata Properties */}
                        {shape.properties && Object.keys(shape.properties).some(k => shape.properties![k]) && (
                            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    Details
                                </h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {Object.entries(shape.properties).map(([key, value]) => {
                                        if (!value || key === 'notes') return null
                                        return (
                                            <div key={key}>
                                                <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">{key}</p>
                                                <p className="text-xs text-gray-800 truncate">{String(value)}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                                {shape.properties.notes && (
                                    <div className="mt-2 pt-2 border-t border-blue-100">
                                        <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Notes</p>
                                        <p className="text-xs text-gray-700 line-clamp-2">{shape.properties.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Coordinates Table - Compact */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {shape.type === "polygon" ? "Vertices" : "Center"}
                            </h4>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {shape.coordinates.slice(0, shape.type === "circle" ? 1 : 10).map((coord, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded text-xs border border-gray-200"
                                    >
                                        <span className="font-medium text-gray-600">
                                            {shape.type === "polygon" ? `P${idx + 1}` : "Center"}
                                        </span>
                                        <span className="font-mono text-[10px] text-gray-700">
                                            {formatCoord(coord[0])}, {formatCoord(coord[1])}
                                        </span>
                                    </div>
                                ))}
                                {shape.type === "polygon" && shape.coordinates.length > 10 && (
                                    <p className="text-[10px] text-gray-500 text-center py-1">
                                        +{shape.coordinates.length - 10} more vertices
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer Metadata */}
                        <div className="flex flex-col gap-1 px-1">
                            {shape.createdAt && (
                                <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                                    <Calendar className="w-2.5 h-2.5" />
                                    Created: {new Date(shape.createdAt).toLocaleString()}
                                </div>
                            )}
                            {shape.updatedAt && (
                                <div className="text-[10px] text-blue-400 flex items-center gap-1.5 font-medium">
                                    <Calendar className="w-2.5 h-2.5" />
                                    Updated: {new Date(shape.updatedAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - Sticky Bottom */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2 flex-shrink-0">
                        {onOpenDetails && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-1.5 text-xs h-9"
                                onClick={() => onOpenDetails(shape.id)}
                                title="Edit Details"
                            >
                                <Palette className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Details</span>
                            </Button>
                        )}
                        {onEdit && shape.type === "polygon" && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-1.5 text-xs h-9"
                                onClick={() => {
                                    onEdit(shape.id)
                                    onClose()
                                }}
                                title="Edit Vertices"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Nodes</span>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 text-xs h-9"
                            onClick={() => onZoom(shape.id)}
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Zoom</span>
                        </Button>
                        {showExport ? (
                            <div className="flex-1 flex gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-9 px-1" onClick={() => onExport(shape.id, 'json')}>JSON</Button>
                                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-9 px-1" onClick={() => onExport(shape.id, 'geojson')}>GeoJSON</Button>
                                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-9 px-1" onClick={() => onExport(shape.id, 'kml')}>KMZ</Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-1.5 text-xs h-9"
                                onClick={() => setShowExport(true)}
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 gap-1.5 text-xs h-9"
                            onClick={() => {
                                if (confirm(`Delete ${shape.name || "this shape"}?`)) {
                                    onDelete(shape.id)
                                    onClose()
                                }
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
