"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shapes,
  ChevronRight,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Download,
  MapPin,
  OctagonIcon as Polygon,
  MoreVertical,
  Palette,
  FilePenLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useEditTools } from "@/hooks/use-edit-tools"
import type { DrawnShape } from "@/lib/types/shape"

const COLORS = [
  { name: "Blue", value: "#3388ff" },
  { name: "Red", value: "#ff3333" },
  { name: "Green", value: "#33ff33" },
  { name: "Orange", value: "#ff6b35" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Yellow", value: "#fbbf24" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
]

export function DrawnShapesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false)
  const {
    drawnShapes,
    draftingShape,
    deleteShape,
    toggleShapeVisibility,
    zoomToShape,
    selectedShape,
    setSelectedShape,
    showDetailsPopup,
    setShowDetailsPopup,
    exportSingleShape,
    hiddenShapes,
    updateShapeDetails,
    updateShapeColor,
  } = useEditTools()

  const isMobile = useIsMobile()

  const handleEditShape = (shape: DrawnShape) => {
    setSelectedShape(shape)
    setShowDetailsPopup(true)
  }

  const handleDeleteShape = (shapeId: string, shapeName: string) => {
    if (confirm(`Are you sure you want to delete "${shapeName}"? This action cannot be undone.`)) {
      deleteShape(shapeId)
    }
  }

  // Permanently hide/unhide polygon
  const handleToggleHide = (shapeId: string) => {
    // Get current hidden polygon IDs from localStorage
    const hidden = JSON.parse(localStorage.getItem('hiddenPolygons') || '[]');
    const total = drawnShapes.length;
    const maxHide = Math.max(1, Math.floor(total * 0.1)); // At least 1
    let updated;
    if (hidden.includes(shapeId)) {
      // Unhide: remove from localStorage and state
      updated = hidden.filter((id: string) => id !== shapeId);
      localStorage.setItem('hiddenPolygons', JSON.stringify(updated));
      toggleShapeVisibility(shapeId); // always toggle state
      setTimeout(() => setIsOpen(isOpen => isOpen), 0); // force re-render
    } else {
      if (hidden.length >= maxHide) {
        // silently do nothing if max hidden reached
        return;
      }
      updated = [...hidden, shapeId];
      localStorage.setItem('hiddenPolygons', JSON.stringify(updated));
      toggleShapeVisibility(shapeId); // always toggle state
      setTimeout(() => setIsOpen(isOpen => isOpen), 0); // force re-render
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatArea = (area?: number) => {
    if (area == null) return "N/A"
    if (area > 1_000_000) return `${(area / 1_000_000).toFixed(2)} km²`
    return `${area.toFixed(0)} m²`
  }

  const formatPerimeter = (perimeter?: number) => {
    if (perimeter == null) return "N/A"
    if (perimeter > 1000) return `${(perimeter / 1000).toFixed(2)} km`
    return `${perimeter.toFixed(0)} m`
  }

  const renderItem = (shape: DrawnShape, index: number, isDraft = false) => {
    // Use persistent hidden state from localStorage
    const hiddenIds = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('hiddenPolygons') || '[]') : [];
    const isHidden = !isDraft && hiddenIds.includes(shape.id);
    // Advanced search filter
    if (searchTerm && !String(shape.properties?.name || '').toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }
    return (
      <motion.div
        key={shape.id + (isDraft ? "-draft" : "")}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`p-3 rounded-lg border transition-all duration-200 ${isHidden
            ? "bg-gray-50 border-gray-200 opacity-60"
            : isDraft
              ? "bg-indigo-50 border-indigo-200"
              : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md"
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div
              className={`p-2 rounded-lg ${isDraft ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"}`}
            >
              <Polygon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-800 truncate">{shape.properties?.name || `Polygon ${index + 1}`}</h4>
            </div>
          </div>
          {!isDraft && (
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleToggleHide(shape.id)}
                title={isHidden ? "Unhide polygon" : "Hide polygon"}
                aria-label={isHidden ? "Unhide polygon" : "Hide polygon"}
              >
                {isHidden ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-blue-600" />}
              </Button>
              {isMobile ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="p-4 space-y-2">
                    <button
                      className="flex items-center w-full p-2 rounded hover:bg-gray-100"
                      onClick={() => zoomToShape(shape.id)}
                    >
                      <MapPin className="h-4 w-4 mr-2" /> Zoom to Polygon
                    </button>
                    <button
                      className="flex items-center w-full p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        handleEditShape(shape)
                        window.open(`/polygons/${shape.id}/edit`, "_blank")
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" /> Edit in Modal
                    </button>
                    <Link
                      href={`/polygons/${shape.id}/edit`}
                      className="flex items-center w-full p-2 rounded hover:bg-gray-100"
                      aria-label="Open full edit page"
                    >
                      <FilePenLine className="h-4 w-4 mr-2" /> Open Edit Page
                    </Link>
                    <button
                      className="flex items-center w-full p-2 rounded hover:bg-gray-100"
                      onClick={() => exportSingleShape(shape.id)}
                    >
                      <Download className="h-4 w-4 mr-2" /> Export Polygon
                    </button>
                    <button
                      className="flex items-center w-full p-2 rounded text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteShape(shape.id, shape.properties?.name || `Polygon ${index + 1}`)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Polygon
                    </button>
                  </SheetContent>
                </Sheet>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom" className="z-[9999]">
                    <DropdownMenuItem onClick={() => zoomToShape(shape.id)}>
                      <MapPin className="h-4 w-4 mr-2" /> Zoom to Polygon
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      handleEditShape(shape)
                      window.open(`/polygons/${shape.id}/edit`, "_blank")
                    }}>
                      <Edit3 className="h-4 w-4 mr-2" /> Edit in Modal
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/polygons/${shape.id}/edit`} className="flex items-center">
                        <FilePenLine className="h-4 w-4 mr-2" /> Open Edit Page
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportSingleShape(shape.id)}>
                      <Download className="h-4 w-4 mr-2" /> Export Polygon
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteShape(shape.id, shape.properties?.name || `Polygon ${index + 1}`)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Polygon
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Show search bar only when dropdown is open
  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start p-3 h-auto bg-purple-50/50 hover:bg-purple-100/50 transition-all duration-200 rounded-xl"
          >
            <Shapes className="h-5 w-5 mr-3 text-purple-600" />
            <span className="font-semibold text-gray-800">Drawn Polygons</span>
            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
              {drawnShapes.length}
            </Badge>
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Button>
        </CollapsibleTrigger>

        {isOpen && (
          <div className="px-4 py-2">
            <input
              type="text"
              className="w-full rounded-md border px-2 py-1 text-sm"
              placeholder="Search polygon names..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <CollapsibleContent forceMount>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {/* Live draft (real-time while drawing) */}
              {draftingShape && renderItem(draftingShape, 0, true)}

              {/* Filtered polygons */}
              {drawnShapes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shapes className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No polygons drawn yet</p>
                  <p className="text-xs text-gray-400 mt-1">Use the polygon tool to start drawing</p>
                </div>
              ) : (
                (() => {
                  const filtered = drawnShapes.filter(
                    shape => !searchTerm || String(shape.properties?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Shapes className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No polygons match your search</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different name or clear the search</p>
                      </div>
                    );
                  }
                  return filtered.map((shape, index) => renderItem(shape, index + (draftingShape ? 1 : 0), false));
                })()
              )}
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}
