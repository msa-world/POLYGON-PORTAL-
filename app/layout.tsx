import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayerProvider } from '@/lib/contexts/layer-context'
import { MapProvider } from '@/lib/contexts/map-context'
import { EditToolsProvider } from '@/components/map/edit-tools-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Islamabad Details Portal - Web GIS Application',
  description: 'Professional Web GIS application for Rawalpindi region mapping and analysis',
  keywords: 'GIS, mapping, Rawalpindi, geospatial, web application',
  generator: 'MSA-CREATIVES',
  contact: "https://portfolio-msaapperals-projects.vercel.app/"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className={inter.className}>
        {/* Load scripts in body for better control */}
        <script 
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          async
        />
        <script 
          src="https://unpkg.com/geotiff@2.0.7/dist-browser/geotiff.js"
          async
        />
        <script 
          src="https://unpkg.com/georaster@1.6.0/dist/georaster.browser.bundle.min.js"
          async
        />
        <script 
          src="https://unpkg.com/georaster-layer-for-leaflet@3.10.0/dist/georaster-layer-for-leaflet.min.js"
          async
        />
        <MapProvider>
          <LayerProvider>
            <EditToolsProvider>
              {children}
            </EditToolsProvider>
          </LayerProvider>
        </MapProvider>
      </body>
    </html>
  )
}
