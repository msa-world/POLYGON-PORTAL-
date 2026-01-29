'use client'

import { useLayerPanel } from '@/components/map/layer-panel-context'
import { motion, AnimatePresence } from 'framer-motion'
import { MouzaLayerItem } from '@/components/map/mouza-layer-item'
import { MouzaLayer } from '@/lib/types/layer'
import { ChevronDown, MapPinned } from 'lucide-react'

interface MouzaLayersSectionProps {
  layers: MouzaLayer[]
  searchTerm: string
}

export function MouzaLayersSection({ layers, searchTerm }: MouzaLayersSectionProps) {
  const { mouzaLayersOpen, setMouzaLayersOpen, mouzaGroupOpen, setMouzaGroupOpen } = useLayerPanel()

  const toggleGroup = (id: string) => {
    setMouzaGroupOpen(mouzaGroupOpen === id ? null : id)
  }

  // Optionally filter layers by searchTerm
  const filteredLayers = layers.filter(layer =>
    layer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="mt-4 space-y-2">
      {/* Section Header */}
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-white/40 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-2xl hover:bg-white/60 transition-all duration-300 border border-white/30 glass-dropdown font-semibold text-gray-700"
        onClick={() => setMouzaLayersOpen(!mouzaLayersOpen)}
      >
        <span className="flex items-center gap-2">
          <MapPinned className="w-4 h-4 text-green-500" />
          Raster Layers
        </span>
        <motion.span
          initial={false}
          animate={{ rotate: mouzaLayersOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="text-gray-500"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>

      {/* Content */}
      {/* Always keep the mouza layer list mounted, just hide with CSS */}
      <div
        className={`space-y-2 transition-all duration-300 ${mouzaLayersOpen ? 'block' : 'hidden'} glass-dropdown-content`}
      >
        {filteredLayers.map((layer, index) => (
          <div key={layer.id}>
            {layer.isGroup ? (
              <div className="bg-white/40 backdrop-blur-xl rounded-lg shadow-md border border-white/30 glass-dropdown-group hover:shadow-2xl transition-all duration-300">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-green-300"
                  onClick={() => toggleGroup(layer.id)}
                >
                  <span>{layer.name}</span>
                  <span
                    className="transition-transform duration-300"
                    style={{ transform: mouzaGroupOpen === layer.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </span>
                </button>

                {/* Always keep group children mounted, just hide with CSS */}
                <div
                  className={`pl-4 mt-2 space-y-2 border-l border-green-200 overflow-hidden transition-all duration-300 ${mouzaGroupOpen === layer.id ? 'block' : 'hidden'}`}
                >
                  {layer.children.map((child: MouzaLayer) => (
                    <MouzaLayerItem
                      key={child.id}
                      layer={child}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-xl rounded-lg shadow-md border border-white/30 glass-dropdown-group hover:shadow-2xl transition-all duration-300 hover:bg-green-50">
                <MouzaLayerItem
                  layer={layer}
                  searchTerm={searchTerm}
                />
              </div>
            )}
          </div>
        ))}

        {layers.length === 0 && searchTerm && (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <MapPinned className="w-6 h-6 mb-2 opacity-50" />
            <p className="text-sm">
              No mouza layers found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
