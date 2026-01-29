export interface ShapeStyle {
  color?: string
  weight?: number
  opacity?: number
  fillColor?: string
  fillOpacity?: number
}

export interface ShapeProperties {
  name?: string
  description?: string
  category?: string
  notes?: string
  zone?: string
  location?: string
  type?: string
  mouza?: string
  sector?: string
  society?: string
  landuse?: string
  ownership?: string
  [key: string]: any
}

export interface DrawnShape {
  id: string
  name?: string
  description?: string
  notes?: string
  type: 'polygon' | 'circle'
  coordinates: any[]
  radius?: number // For circles
  createdAt: string
  updatedAt?: string
  properties?: ShapeProperties
  style?: ShapeStyle
  area?: number
  perimeter?: number
  vertices?: number
}

