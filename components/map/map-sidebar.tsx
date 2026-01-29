"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { DataLayersSection } from "@/components/map/data-layers-section"
import { Shapes, Layers, ImageIcon } from "lucide-react"
import { DrawnShapesSection } from "@/components/map/drawn-shapes-section"
import { ImagerySection } from "@/components/map/imagery-section"
import { useSearch } from "@/hooks/use-search"
import { LayerPanelProvider } from "@/components/map/layer-panel-context"

interface MapSidebarProps {
  width: number
}

export function MapSidebar({ width }: MapSidebarProps) {
  const { searchTerm, setSearchTerm, filteredDataLayers } = useSearch()

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  // Derive collapsed state from width
  const isCollapsed = width <= 80

  // Icon bar for collapsed sidebar
  const iconBar = (
    <div className="h-full w-full bg-[#222] flex flex-col items-center justify-between py-4 border-r border-gray-800 shadow-lg overflow-hidden">
      <div className="flex flex-col gap-6 mt-2 items-center w-full">
        <button title="Drawn Polygons" className="p-2 rounded-full hover:bg-gray-700">
          <Shapes className="h-6 w-6 text-white" />
        </button>
        <button title="Data Layers" className="p-2 rounded-full hover:bg-gray-700">
          <Layers className="h-6 w-6 text-white" />
        </button>

        <button title="Imagery" className="p-2 rounded-full hover:bg-gray-700">
          <ImageIcon className="h-6 w-6 text-white" />
        </button>
      </div>
      <div className="mb-2 w-full flex justify-center">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
          <span className="text-white font-bold text-xs">MAP</span>
        </div>
      </div>
    </div>
  )

  return (
    <LayerPanelProvider>
      <div className="h-full w-full">
        {isCollapsed ? (
          iconBar
        ) : (
          <aside
            className="h-full w-full flex flex-col bg-white/70 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/30 transition-all duration-300 sidebar-glass overflow-hidden"
            style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
          >
            {/* Search Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.18 }}
              className="p-5 border-b border-white/20 bg-white/40 backdrop-blur-xl rounded-t-3xl shadow-md relative z-10"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                <Input
                  placeholder="Search layers, places..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 bg-white/70 border-white/30 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl shadow-sm text-base"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-blue-100/40 hover:backdrop-blur-lg transition"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="layer-sections"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-7"
                  >
                    {/* Drawn Shapes Section - Top Priority */}
                    <motion.section
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="glass-section rounded-2xl bg-white/60 shadow-lg border border-purple-100/40 px-3 py-2"
                    >
                      <h3 className="text-lg font-semibold text-purple-700 mb-2 tracking-wide">Drawn Polygons</h3>
                      <DrawnShapesSection />
                    </motion.section>

                    {/* Data Layers Section */}
                    <motion.section
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      className="glass-section rounded-2xl bg-white/60 shadow-lg border border-blue-100/40 px-3 py-2"
                    >
                      <h3 className="text-lg font-semibold text-blue-700 mb-2 tracking-wide">Vector Layers</h3>
                      <DataLayersSection layers={filteredDataLayers} searchTerm={searchTerm} />
                    </motion.section>



                    {/* Imagery Section */}
                    <motion.section
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                      className="glass-section rounded-2xl bg-white/60 shadow-lg border border-purple-100/40 px-3 py-2"
                    >
                      <h3 className="text-lg font-semibold text-purple-700 mb-2 tracking-wide">Imagery</h3>
                      <ImagerySection />
                    </motion.section>
                  </motion.div>
                </AnimatePresence>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </LayerPanelProvider>
  )
}
