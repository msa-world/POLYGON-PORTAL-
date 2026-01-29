'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Loader2 } from 'lucide-react'
import { DataLayer } from '@/lib/types/layer'
import { useLayer } from '@/hooks/use-layer'
import { highlightSearchTerm } from '@/lib/utils'
// import { DATA_LAYERS } from '@/lib/constants/layers' // No longer needed here, used in use-layer.ts

interface LayerItemProps {
  layer: DataLayer
  searchTerm: string
}

export function LayerItem({ layer, searchTerm }: LayerItemProps) {
  const { toggleLayer, updateLayerStyle, isLayerActive, isLayerLoading, getLayerStyle } = useLayer()
  
  // Get current state directly from hook, these are always fresh
  const isActive = isLayerActive(layer.id)
  const isLoading = isLayerLoading(layer.id)
  const currentStyle = getLayerStyle(layer.id) 
  
  // Local state for sliders and color picker, initialized from currentStyle
  const [colorPickerValue, setColorPickerValue] = useState(currentStyle.color ?? layer.style?.color ?? '#000000')
  const [opacityValue, setOpacityValue] = useState([currentStyle.opacity ?? layer.style?.opacity ?? 1])

  // Effect to sync local slider/color values with global style state
  useEffect(() => {
    if (isActive) {
      const style = getLayerStyle(layer.id);
      console.log(`[LayerItem] useEffect sync for ${layer.id}. isActive=${isActive}. Current style in hook:`, style);
      setColorPickerValue(style.color ?? layer.style?.color ?? '#000000');
      setOpacityValue([style.opacity ?? layer.style?.opacity ?? 1]);
    } else {
      setColorPickerValue(layer.style?.color ?? '#000000');
      setOpacityValue([layer.style?.opacity ?? 1]);
    }
  }, [layer.id, getLayerStyle, layer.style, isActive]);

  const handleToggle = async (checked: boolean) => {
    await toggleLayer(layer.id, layer)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    console.log(`[LayerItem] Color change for ${layer.id}:`, color)
    setColorPickerValue(color) // Update local state for immediate feedback
    updateLayerStyle(layer.id, { color }) // Update global state
  }

  const handleOpacityChange = (opacity: number[]) => {
    console.log(`[LayerItem] Opacity change for ${layer.id}:`, opacity[0])
    setOpacityValue(opacity) // Update local state for immediate feedback
    updateLayerStyle(layer.id, { opacity: opacity[0], fillOpacity: opacity[0] }) // Update global state
  }

  console.log(`[LayerItem] Rendering ${layer.id}. isActive: ${isActive}, isLoading: ${isLoading}`); // Added this log

  return (
    <motion.div
      className={`p-3 rounded-xl border transition-all duration-300 glass-layer-item shadow-md ${
        isActive 
          ? 'bg-blue-100/60 border-blue-200 shadow-xl' 
          : 'bg-white/40 border-white/30 hover:bg-blue-50/60 hover:shadow-2xl'
      }`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={isActive} // Direct binding to the persistent hook state
          onCheckedChange={handleToggle}
          disabled={isLoading}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <span 
          className="flex-1 text-sm font-medium text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: highlightSearchTerm(layer.name, searchTerm) 
          }}
        />
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 text-xs text-blue-600"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </motion.div>
        )}
      </div>

      {isActive && !isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 space-y-3 border-t pt-3"
        >
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={colorPickerValue}
              onChange={handleColorChange}
              className="w-8 h-8 rounded border-none cursor-pointer"
              title="Change layer color"
            />
            <div className="flex-1">
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
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
