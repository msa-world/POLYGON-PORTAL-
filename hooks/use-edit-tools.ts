"use client"

import { useEditTools as useEditToolsContext } from "@/components/map/edit-tools-context"

export function useEditTools() {
  const context = useEditToolsContext()

  // Backwards compatibility for existing hook signature
  return {
    ...context,
    // Add any specific backwards compatibility mappings if needed
    undoPolygonPoint: context.undoPolygonPoint,
    redoPolygonPoint: context.redoPolygonPoint,
    canUndo: context.canUndo,
    canRedo: context.canRedo,
    startEditingPolygon: context.startEditingPolygon,
    isDrawingEnabled: context.isDrawingEnabled,
    setIsDrawingEnabled: context.setIsDrawingEnabled,
    saveEditedPolygon: context.saveEditedPolygon,
  }
}
