'use client'

import { useEditTools } from '@/hooks/use-edit-tools'
import { ShapeDetailsPopup } from '@/components/map/shape-details-popup'

export function PolygonDetailsModal() {
  const {
    selectedShape,
    showDetailsPopup,
    setShowDetailsPopup,
    updateShapeDetails,
  } = useEditTools()

  const handleSaveDetails = (details: any) => {
    if (selectedShape) {
      updateShapeDetails(selectedShape.id, details)
      setShowDetailsPopup(false)
    }
  }

  if (!showDetailsPopup || !selectedShape) return null

  return (
    <ShapeDetailsPopup
      shape={selectedShape}
      isOpen={showDetailsPopup}
      onClose={() => setShowDetailsPopup(false)}
      onSave={handleSaveDetails}
    />
  )
}
