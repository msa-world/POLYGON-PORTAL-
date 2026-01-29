'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { MapSidebar } from '@/components/map/map-sidebar'
import { ShapeDetailsPopup } from '@/components/map/shape-details-popup'
import { PolygonDetailsModal } from '@/components/map/polygon-details-modal'
import { useMap } from '@/hooks/use-map'
import { useEditTools } from '@/hooks/use-edit-tools'
import { EditToolsProvider } from '@/components/map/edit-tools-context'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { WelcomePopup } from '@/components/map/welcome-popup'

export default function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(340)
  const mapRef = useRef<HTMLDivElement>(null)

  // Use context for map state
  const { initializeMap, map, isLeafletLoaded } = useMap()

  // Initialize map when container is ready
  useEffect(() => {
    if (mapRef.current && isLeafletLoaded) {
      // If map is already initialized in context, this will just return it
      // If not, it will initialize it
      initializeMap(mapRef.current)
    }
  }, [initializeMap, isLeafletLoaded])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Show loading only if Leaflet scripts haven't loaded yet
  if (!isLeafletLoaded) {
    return <LoadingScreen />
  }

  return (
    <EditToolsProvider>
      <MainAppContent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
        mapRef={mapRef}
      />
    </EditToolsProvider>
  )
}

interface MainAppContentProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  mapRef: React.RefObject<HTMLDivElement | null>
}

function MainAppContent({
  sidebarOpen,
  setSidebarOpen,
  sidebarWidth,
  setSidebarWidth,
  toggleSidebar,
  closeSidebar,
  mapRef,
}: MainAppContentProps) {
  const {
    selectedShape,
    showDetailsPopup,
    setShowDetailsPopup,
    updateShapeDetails,
    activeEditTool,
    setActiveEditTool,
    canUndo,
    canRedo,
    undoPolygonPoint,
    redoPolygonPoint,
  } = useEditTools()

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeEditTool === "polygon" && (e.ctrlKey || e.metaKey)) {
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault()
          if (canUndo) undoPolygonPoint()
        } else if (e.key === "y" || (e.shiftKey && (e.key === "z" || e.key === "Z"))) {
          e.preventDefault()
          if (canRedo) redoPolygonPoint()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeEditTool, canUndo, canRedo, undoPolygonPoint, redoPolygonPoint])

  return (
    <>
      <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <motion.nav
        className={`fixed top-0 left-0 h-screen z-[2000] bg-white/90 backdrop-blur-xl shadow-2xl border-r border-white/20 rounded-r-3xl overflow-y-auto pt-20 pb-6 px-4 transition-transform duration-500 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ width: `${sidebarWidth}px`, minWidth: "180px", maxWidth: "96vw" }}
        initial={false}
        animate={{
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        transition={{ duration: 0.4, ease: [0.77, 0, 0.18, 1] }}
      >
        {/* Sidebar Resizer */}
        <div
          className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-blue-100/50 transition-colors"
          onMouseDown={(e) => {
            const startX = e.clientX
            const startWidth = sidebarWidth

            const handleMouseMove = (e: MouseEvent) => {
              // Determine new width, allowing it to go down to 60px for icon mode
              const rawWidth = startWidth + (e.clientX - startX)
              // Standard linear with min 60.
              const newWidth = Math.max(60, Math.min(700, rawWidth))

              setSidebarWidth(newWidth)
            }

            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove)
              document.removeEventListener("mouseup", handleMouseUp)
              document.body.style.cursor = ""
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
            document.body.style.cursor = "ew-resize"
          }}
        />

        <ErrorBoundary>
          <MapSidebar width={sidebarWidth} />
        </ErrorBoundary>
      </motion.nav>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-[1999] lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Modal for detail editing (Name, Color, etc.) */}
      <PolygonDetailsModal />

      {/* Undo/Redo Floating Buttons (show only when polygon tool is active) */}
      {activeEditTool === "polygon" && (
        <div className="fixed bottom-8 right-8 z-[4000] flex flex-col gap-3">
          <button
            onClick={undoPolygonPoint}
            disabled={!canUndo}
            className={`bg-white/90 border border-blue-200 shadow-lg rounded-full p-3 flex items-center justify-center transition-all duration-150 hover:bg-blue-50 active:scale-95 ${!canUndo ? "opacity-50 cursor-not-allowed" : ""
              }`}
            title="Undo (Ctrl+Z)"
          >
            <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h7a7 7 0 1 1 0 14h-1" />
            </svg>
          </button>
          <button
            onClick={redoPolygonPoint}
            disabled={!canRedo}
            className={`bg-white/90 border border-blue-200 shadow-lg rounded-full p-3 flex items-center justify-center transition-all duration-150 hover:bg-blue-50 active:scale-95 ${!canRedo ? "opacity-50 cursor-not-allowed" : ""
              }`}
            title="Redo (Ctrl+Y)"
          >
            <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M15 10l5 5-5 5" />
              <path d="M20 15h-7a7 7 0 1 1 0-14h1" />
            </svg>
          </button>
        </div>
      )}

      {/* Map Container */}
      <motion.div
        ref={mapRef}
        className="h-full w-full relative pt-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        id="map"
        onClick={() => {
          if (window.innerWidth < 1024 && sidebarOpen) {
            closeSidebar()
          }
        }}
      />
      {/* Welcome Popup */}
      <WelcomePopup
        onStartDrawing={() => {
          setSidebarOpen(true)
          setActiveEditTool("polygon")
        }}
        onDismiss={() => { }}
      />
    </>
  )
}
