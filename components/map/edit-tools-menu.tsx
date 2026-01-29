"use client"

import { motion, AnimatePresence } from "framer-motion"
import { BoldIcon as Polygon, Circle, Trash2, Save, Download, Upload, Pencil, Eye, EyeOff, MapPin, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditTools } from "@/hooks/use-edit-tools"
import { Switch } from "@/components/ui/switch"

interface EditToolsMenuProps {
  open: boolean
  onClose: () => void
}

const drawingTools = [
  { id: "polygon", name: "Draw Polygon", icon: Polygon, description: "Click to draw, double-click to finish" },
  { id: "circle", name: "Draw Circle", icon: Circle, description: "Click center, drag to set radius" },
]

const managementTools = [
  { id: "save", name: "Save All", icon: Save, description: "Save to browser storage" },
  { id: "exportKMZ", name: "Export KMZ", icon: Download, description: "Download as KMZ file" },
  { id: "exportGeoJSON", name: "Export GeoJSON", icon: Download, description: "Download as GeoJSON file" },
  { id: "import", name: "Import", icon: Upload, description: "Load from JSON file" },
  { id: "importGeoJSON", name: "Import GeoJSON", icon: Upload, description: "Load polygons from GeoJSON file" },
  { id: "delete", name: "Delete All", icon: Trash2, description: "Remove all polygons" },
]

export function EditToolsMenu({ open, onClose }: EditToolsMenuProps) {
  const {
    activeEditTool,
    setActiveEditTool,
    deleteAllShapes,
    saveShapes,
    exportShapes,
    exportShapesAsGeoJSON,
    exportShapesAsDatabase,
    importShapes,
    drawnShapes,
    precisionMode,
    setPrecisionMode,
    selectedPolygon,
    importShapesFromGeoJSON,
    exportShapesAsKMZ,
    isDrawingEnabled,
    setIsDrawingEnabled,
    saveEditedPolygon,
    selectedShape,
    startEditingGeometry,
    startEditingDetails,
    zoomToShape,
    deleteShape,
    visibleTypes,
    toggleTypeVisibility,
  } = useEditTools()

  const handleToolSelect = (toolId: string) => {
    if (toolId === "delete") {
      if (drawnShapes.length === 0) return
      if (
        confirm(`Are you sure you want to delete all ${drawnShapes.length} polygons? This action cannot be undone.`)
      ) {
        deleteAllShapes()
      }
    } else if (toolId === "save") {
      if (drawnShapes.length === 0) return
      saveShapes()
    } else if (toolId === "export") {
      if (drawnShapes.length === 0) return
      exportShapes()
    } else if (toolId === "exportGeoJSON") {
      if (drawnShapes.length === 0) return
      exportShapesAsGeoJSON()
    } else if (toolId === "exportDatabase") {
      if (drawnShapes.length === 0) return
      exportShapesAsDatabase()
    } else if (toolId === "import") {
      importShapes()
    } else if (toolId === "importGeoJSON") {
      if (typeof window !== "undefined" && importShapesFromGeoJSON) {
        importShapesFromGeoJSON()
      }
    } else if (toolId === "exportKMZ") {
      if (drawnShapes.length === 0) return
      exportShapesAsKMZ()
    } else {
      setActiveEditTool(toolId === activeEditTool ? null : toolId)
    }
    onClose()
  }

  const ToolSection = ({ title, tools, color }: { title: string; tools: any[]; color: string }) => (
    <div className="mb-4">
      <div className={`px-3 py-2 text-xs font-semibold ${color} border-b border-gray-200 mb-2`}>{title}</div>
      {tools.map((tool, index) => {
        const Icon = tool.icon
        const isActive = activeEditTool === tool.id
        const isDisabled =
          (tool.id === "save" ||
            tool.id === "export" ||
            tool.id === "exportGeoJSON" ||
            tool.id === "exportDatabase" ||
            tool.id === "delete") &&
          drawnShapes.length === 0

        return (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
          >
            <div className="flex items-center gap-2 mb-1">
              <Button
                variant="ghost"
                disabled={isDisabled}
                className={`flex-1 justify-start p-3 h-auto transition-all duration-200 ${isActive
                  ? "bg-blue-200 text-blue-700 border border-blue-200 shadow-sm"
                  : isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-200"
                  } rounded-xl`}
                onClick={() => handleToolSelect(tool.id)}
              >
                <Icon
                  className={`h-4 w-4 mr-3 ${isActive ? "text-blue-700" : isDisabled ? "text-gray-400" : "text-blue-600"
                    }`}
                />
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold">{tool.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{tool.description}</div>
                </div>
                {isActive && <div className="ml-2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />}
              </Button>

              {/* Visibility Toggle for Drawing Tools */}
              {title === "Drawing Tools" && (
                <div className="flex items-center bg-white/80 backdrop-blur-sm self-stretch px-2 rounded-xl border border-gray-100 shadow-sm">
                  <Switch
                    checked={visibleTypes.has(tool.id)}
                    onCheckedChange={() => toggleTypeVisibility(tool.id)}
                    className="data-[state=checked]:bg-green-500 scale-90"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-4 z-[3000] w-full max-w-sm glass-dropdown shadow-2xl border border-white/20 overflow-hidden max-h-[80vh] overflow-y-auto mx-auto sm:right-4 sm:top-16 sm:mx-0 bg-white/60 backdrop-blur-xl"
            style={{ backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)" }}
          >
            {activeEditTool === "edit-polygon" && selectedShape ? (
              // Edit Mode View
              <div className="p-4">
                <div className="mb-4 px-3 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-md flex items-center justify-between">
                  <span>Editing: {selectedShape.name || "Polygon"}</span>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700">
                  Drag the white markers to adjust vertices. Click "Save Changes" when done.
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => saveEditedPolygon()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setActiveEditTool(null)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // Normal Mode View
              <div className="p-4">
                <div className="mb-4 px-3 py-2 text-sm font-bold text-gray-800 border-b-2 border-blue-200 bg-blue-50/60 rounded-lg glass-section backdrop-blur-md">
                  Drawing Tools ({drawnShapes.length} shapes)
                </div>
                <div className="space-y-2">
                  <div className="rounded-xl bg-white/100 backdrop-blur-md p-1">
                    <ToolSection title="Drawing Tools" tools={drawingTools} color="text-green-700" />
                  </div>
                  <div className="rounded-xl bg-white/100 backdrop-blur-md p-1">
                    <ToolSection title="Management" tools={managementTools} color="text-purple-700" />
                  </div>

                  <div className="rounded-xl bg-white/100 backdrop-blur-md p-1 mt-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-700 border-b border-gray-200 mb-2 flex justify-between items-center">
                      <span>Saved Polygons</span>
                      <span className="bg-gray-100 text-gray-600 px-1.5 rounded-full">{drawnShapes.length}</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {drawnShapes.length === 0 ? (
                        <div className="text-xs text-gray-400 p-3 text-center italic">No shapes yet</div>
                      ) : (
                        drawnShapes.map(shape => (
                          <div key={shape.id} className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg group transition-colors border border-transparent hover:border-blue-100">
                            <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{shape.name}</span>
                            <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-100" onClick={() => zoomToShape(shape.id)} title="Zoom to">
                                <MapPin className="h-3 w-3" />
                              </Button>
                              {shape.type === 'polygon' && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-100" onClick={() => startEditingGeometry(shape.id)} title="Edit Nodes">
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:text-blue-600 hover:bg-blue-100" onClick={() => startEditingDetails(shape.id)} title="Edit Details">
                                <Palette className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => deleteShape(shape.id)} title="Delete">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
