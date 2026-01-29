"use client"

import { useLayerPanel } from "@/components/map/layer-panel-context"
import { motion } from "framer-motion"
import { ImageIcon, ChevronDown, Locate } from "lucide-react"
import { Loader2 } from "lucide-react"
import { useRaster } from "@/hooks/use-raster"
import { IMAGERY_LAYERS } from "@/lib/constants/layers"

export function ImagerySection() {
  const { imageryOpen, setImageryOpen } = useLayerPanel()
  const { loadRaster, isRasterActive, isRasterLoading, zoomToRaster } = useRaster()

  const handleToggle = async (layer: any) => {
    await loadRaster(layer.id, layer.wmsUrl, layer.layerName)
  }

  const handleLocate = (layer: any) => {
    zoomToRaster(layer.id)
  }

  return (
    <div className="mt-4 space-y-2">
      {/* Section Header */}
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-white/40 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-2xl hover:bg-white/60 transition-all duration-300 border border-white/30 glass-dropdown font-semibold text-gray-700"
        onClick={() => setImageryOpen(!imageryOpen)}
      >
        <span className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-500" />
          Imagery Layers
        </span>
        <motion.span
          initial={false}
          animate={{ rotate: imageryOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-gray-500"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>

      {/* Content */}
      <div
        className={`space-y-2 transition-all duration-300 ${imageryOpen ? "block" : "hidden"} glass-dropdown-content`}
      >
        {IMAGERY_LAYERS.map((layer) => (
          <div
            key={layer.id}
            className="bg-white/40 backdrop-blur-xl rounded-lg shadow-md border border-white/30 glass-dropdown-group hover:shadow-2xl transition-all duration-300 hover:bg-purple-50"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={isRasterActive(layer.id)}
                  onChange={() => handleToggle(layer)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700">{layer.name}</span>
                {isRasterLoading(layer.id) && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
              </label>

              {/* Locate Button */}
              {isRasterActive(layer.id) && (
                <button
                  onClick={() => handleLocate(layer)}
                  className="ml-2 p-1 rounded hover:bg-purple-100 transition-colors"
                  title="Zoom to layer"
                >
                  <Locate className="w-4 h-4 text-purple-600" />
                </button>
              )}
            </div>
          </div>
        ))}

        {IMAGERY_LAYERS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
            <p className="text-sm">No imagery layers available</p>
          </div>
        )}
      </div>
    </div>
  )
}
