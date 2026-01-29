'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMap } from '@/hooks/use-map'
import { Sidebar, SidebarContent, SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { MapSidebar } from '@/components/map/map-sidebar'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function MapContainer() {
  const mapRef = useRef<HTMLDivElement>(null)
  const { initializeMap, map } = useMap()

  useEffect(() => {
    if (mapRef.current && !map) {
      initializeMap(mapRef.current)
    }
  }, [initializeMap, map])

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen pt-16">
        <Sidebar variant="floating" className="border-r-0">
          <SidebarContent>
            <ErrorBoundary>
              <MapSidebar />
            </ErrorBoundary>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1">
          <motion.div
            ref={mapRef}
            className="h-full w-full relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            id="map"
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
