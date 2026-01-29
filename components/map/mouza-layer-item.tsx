'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Loader2, LocateFixed } from 'lucide-react'
import { MouzaLayer } from '@/lib/types/layer'
import { useRaster } from '@/hooks/use-raster'
import { highlightSearchTerm } from '@/lib/utils'

interface MouzaLayerItemProps {
  layer: MouzaLayer
  searchTerm: string
}

export function MouzaLayerItem({ layer, searchTerm }: MouzaLayerItemProps) {
  const {
    loadRaster,
    updateRasterStyle,
    isRasterLoading,
    isRasterActive,
    getRasterStyle,
    zoomToRaster
  } = useRaster()

  const isActive = isRasterActive(layer.id)
  const isLoading = isRasterLoading(layer.id)
  const currentStyle = getRasterStyle(layer.id)

  const [opacityValue, setOpacityValue] = useState([currentStyle.opacity ?? 0.7])
  const [contrastValue, setContrastValue] = useState([currentStyle.contrast ?? 1])
  const [qualityValue, setQualityValue] = useState([currentStyle.quality ?? 0.3])

  useEffect(() => {
    if (isActive) {
      const style = getRasterStyle(layer.id)
      setOpacityValue([style.opacity ?? 0.7])
      setContrastValue([style.contrast ?? 1])
      setQualityValue([style.quality ?? 0.3])
    } else {
      setOpacityValue([0.7])
      setContrastValue([1])
      setQualityValue([0.3])
    }
  }, [isActive, getRasterStyle, layer.id])

  const handleToggle = async (checked: boolean) => {
    if (layer.wmsUrl && layer.layerName) {
      await loadRaster(layer.id, layer.wmsUrl, layer.layerName)
    }
    // Removed local filePath logic for mouza layers
  }

  const handleOpacityChange = (opacity: number[]) => {
    setOpacityValue(opacity)
    updateRasterStyle(layer.id, { opacity: opacity[0] })
  }

  const handleContrastChange = (contrast: number[]) => {
    setContrastValue(contrast)
    updateRasterStyle(layer.id, { contrast: contrast[0] })
  }

  const handleQualityChange = (quality: number[]) => {
    setQualityValue(quality)
    updateRasterStyle(layer.id, { quality: quality[0] })
  }

  const handleLocate = () => {
    zoomToRaster(layer.id)
  }

  return (
    <motion.div
      className={`p-3 rounded-xl border transition-all duration-300 glass-layer-item shadow-md ${
        isActive 
          ? 'bg-green-100/60 border-green-200 shadow-xl' 
          : 'bg-white/40 border-white/30 hover:bg-green-50/60 hover:shadow-2xl'
      }`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isLoading}
          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
        />
        <span
          className="flex-1 text-sm font-medium text-gray-700"
          dangerouslySetInnerHTML={{ __html: highlightSearchTerm(layer.name, searchTerm) }}
        />
        {isActive && (
          <button
            onClick={handleLocate}
            title="Go to Mouza"
            className="p-1 rounded-full hover:bg-green-100 transition"
            type="button"
          >
            <LocateFixed className="w-5 h-5 text-green-600" />
          </button>
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 text-xs text-blue-600"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading Mosaic...</span>
          </motion.div>
        )}
      </div>

      {isActive && !isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 space-y-3 border-t pt-3"
        >
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Opacity: {Math.round(opacityValue[0] * 100)}%
              </label>
              <Slider
                value={opacityValue}
                onValueChange={handleOpacityChange}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Contrast: {contrastValue[0].toFixed(1)}x
              </label>
              <Slider
                value={contrastValue}
                onValueChange={handleContrastChange}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Quality: {Math.round(qualityValue[0] * 100)}%
              </label>
              <Slider
                value={qualityValue}
                onValueChange={handleQualityChange}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
