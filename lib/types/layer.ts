export interface LayerStyle {
  color?: string
  opacity?: number
  fillOpacity?: number
  weight?: number
}

export interface RasterStyle {
  opacity?: number
  contrast?: number
}

export interface DataLayer {
  id: string
  name: string
  filePath: string
  style?: LayerStyle
  isZone?: boolean
}

export interface MouzaLayer {
  id: string
  name: string
  filePath?: string
  style?: RasterStyle
  // WMS support:
  wmsUrl?: string
  layerName?: string
  wms?: boolean
  url?: string
  params?: Record<string, string | number>
}
