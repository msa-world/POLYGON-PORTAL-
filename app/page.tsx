'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { MapProvider } from '@/lib/contexts/map-context'
import { LayerProvider } from '@/lib/contexts/layer-context'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { ErrorBoundary } from '@/components/ui/error-boundary'

// Dynamically import map component to avoid SSR issues
const MainApp = dynamic(() => import('@/components/main-app'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

export default function HomePage() {
  return (
    <ErrorBoundary>
      <MapProvider>
        <LayerProvider>
          <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
            <Suspense fallback={<LoadingScreen />}>
              <MainApp />
            </Suspense>
          </div>
        </LayerProvider>
      </MapProvider>
    </ErrorBoundary>
  )
}
