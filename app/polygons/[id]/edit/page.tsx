"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ShapeEditForm from "@/components/map/shape-edit-form"
import { useEditTools } from "@/hooks/use-edit-tools"
import type { DrawnShape } from "@/lib/types/shape"

export default function PolygonEditPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id ?? ""
  const { getShapeById, updateShapeDetails } = useEditTools()
  const [shape, setShape] = useState<DrawnShape | null>(null)
  const [saved, setSaved] = useState(false)

  // Load shape from hook or storage on mount
  useEffect(() => {
    if (!id) return
    // Prefer global state, fallback to storage
    setShape(getShapeById(id) || null)
  }, [id, getShapeById])

  const handleSave = (details: any) => {
    const latestShape = getShapeById(id)
    if (!latestShape) return
    updateShapeDetails(latestShape.id, details)
    setSaved(true)
    setShape(getShapeById(id) || null) // optional: refresh local state
  }

  if (!shape) {
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Polygon Not Found</CardTitle>
          <CardDescription>
            The polygon you are trying to edit does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto mt-12">
      <CardHeader>
        <CardTitle>Edit Polygon</CardTitle>
        <CardDescription>
          Update the details and styling for this polygon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {saved ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-green-700 font-semibold text-lg">Changes saved successfully!</div>
            <Button onClick={() => router.replace("/")} variant="default">
              Back to Map
            </Button>
          </div>
        ) : (
          <ShapeEditForm
            shape={shape}
            onSubmit={handleSave}
            onCancel={() => router.replace("/")}
          />
        )}
      </CardContent>
    </Card>
  )
}
