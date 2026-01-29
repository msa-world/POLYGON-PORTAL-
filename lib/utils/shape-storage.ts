import { DrawnShape } from '@/lib/types/shape'

const STORAGE_KEY = 'ict-drawn-shapes'

export function saveShapesToStorage(shapes: DrawnShape[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes))
      console.log('[ShapeStorage] Saved', shapes.length, 'shapes to storage')
    }
  } catch (error) {
    console.error('[ShapeStorage] Failed to save shapes:', error)
  }
}

export function loadShapesFromStorage(): DrawnShape[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const shapes = JSON.parse(stored)
        console.log('[ShapeStorage] Loaded', shapes.length, 'shapes from storage')
        return Array.isArray(shapes) ? shapes : []
      }
    }
  } catch (error) {
    console.error('[ShapeStorage] Failed to load shapes:', error)
  }
  return []
}

export function exportShapesToJSON(): string {
  const shapes = loadShapesFromStorage()
  const exportData = {
    shapes,
    exportedAt: new Date().toISOString(),
    version: '1.0',
    metadata: {
      totalShapes: shapes.length,
      application: 'ICT Islamabad GIS System',
      shapeTypes: shapes.reduce((acc, shape) => {
        acc[shape.type] = (acc[shape.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
  return JSON.stringify(exportData, null, 2)
}

export function clearShapesStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      console.log('[ShapeStorage] Cleared shapes storage')
    }
  } catch (error) {
    console.error('[ShapeStorage] Failed to clear shapes:', error)
  }
}
