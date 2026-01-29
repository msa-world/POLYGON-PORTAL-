'use client'

import { useLayerPanel } from '@/components/map/layer-panel-context'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Layers } from 'lucide-react'
import { DataLayer } from '@/lib/types/layer'
import { LayerItem } from '@/components/map/layer-item'

interface DataLayersSectionProps {
  layers: DataLayer[]
  searchTerm: string
}

export function DataLayersSection({ layers, searchTerm }: DataLayersSectionProps) {
  const { dataLayersOpen, setDataLayersOpen } = useLayerPanel()

  return (
    <div className="space-y-2">
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-white/40 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-2xl hover:bg-white/60 transition-all duration-300 border border-white/30 glass-dropdown"
        onClick={() => setDataLayersOpen(!dataLayersOpen)}
      >
        <span className="flex items-center gap-2 font-semibold text-gray-700">
          <Layers className="w-4 h-4 text-blue-500" />
          Vector Layers
        </span>
        <motion.span
          initial={false}
          animate={{ rotate: dataLayersOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </motion.span>
      </button>

      {/* Always keep the layer list mounted, just hide with CSS */}
      <div
        className={`space-y-2 transition-all duration-300 ${dataLayersOpen ? 'block' : 'hidden'} glass-dropdown-content`}
      >
        {layers.map(layer => (
          <LayerItem
            key={layer.id}
            layer={layer}
            searchTerm={searchTerm}
          />
        ))}
      </div>
    </div>
  )
}
