'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Satellite, Map, Mountain, Globe, Moon, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMap } from '@/hooks/use-map'

interface BaseLayerMenuProps {
  open: boolean
  onClose: () => void
}

const baseLayers = [
  { id: 'satellite', name: 'Google Satellite', icon: Satellite },
  { id: 'osm', name: 'OpenStreetMap', icon: Map },
  { id: 'terrain', name: 'Terrain', icon: Mountain },
  { id: 'carto', name: 'CartoDB Positron', icon: Globe },
  { id: 'dark', name: 'Dark Matter', icon: Moon },
  { id: 'esri', name: 'ESRI World Imagery', icon: MapPin },
]

export function BaseLayerMenu({ open, onClose }: BaseLayerMenuProps) {
  const { switchBaseLayer, currentBaseLayer } = useMap()

  const handleLayerSelect = (layerId: string) => {
    switchBaseLayer(layerId)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/10 backdrop-blur-[2px]"
            onClick={onClose}
          />
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.22, type: 'spring', bounce: 0.18 }}
            className="absolute top-12 right-0 z-[2100] w-72 rounded-2xl border border-blue/35 shadow-2xl glass-dropdown bg-blue/70 backdrop-blur-4xl"
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
          >
            <div className="p-3 space-y-1">
              <div className="mb-2 px-2 text-xs font-semibold text-black-600/80 tracking-wide uppercase">
                Base Map Layers
              </div>
              {baseLayers.map((layer, index) => {
                const Icon = layer.icon
                const isActive = currentBaseLayer === layer.id
                return (
                  <motion.div
                    key={layer.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="ghost"
                      className={`
                        w-full flex items-center gap-3 justify-start p-3 h-auto rounded-xl transition-all duration-200 border border-transparent
                        ${isActive
                          ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-md'
                          : 'hover:bg-white/60 hover:backdrop-blur-xl hover:shadow-lg hover:border-white/40'
                        }
                        glass-dropdown-item
                      `}
                      style={{
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        transition: 'background 0.18s, box-shadow 0.18s, border 0.18s'
                      }}
                      onClick={() => handleLayerSelect(layer.id)}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-blue-600/80'}`} />
                      <span className="text-sm font-medium">{layer.name}</span>
                      {isActive && (
                        <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full shadow" />
                      )}
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
