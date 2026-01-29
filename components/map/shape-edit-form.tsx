"use client"

import type React from "react"

import { useMemo, useState } from "react"
import type { DrawnShape } from "@/lib/types/shape"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

type Props = {
  shape: DrawnShape
  onSubmit: (details: {
    name?: string
    description?: string
    category?: string
    zone?: string
    notes?: string
    type?: string
    mouza?: string
    sector?: string
    society?: string
    landuse?: string
    ownership?: string
    style?: {
      color?: string
      fillColor?: string
      weight?: number
      fillOpacity?: number
    }
  }) => void
  onCancel?: () => void
}

export default function ShapeEditForm({ shape, onSubmit, onCancel }: Props) {
  const preset = useMemo(() => {
    const p = shape.properties || {}
    const style = shape.style || {}
    return {
      name: p.name || "",
      description: p.description || "",
      category: p.category || "",
      zone: p.zone || "",
      notes: p.notes || "",
      type: p.type || "",
      mouza: p.mouza || "",
      sector: p.sector || "",
      society: p.society || "",
      landuse: p.landuse || "",
      ownership: p.ownership || "",
      color: (style.color as string) || (style.fillColor as string) || "#3388ff",
      weight: typeof style.weight === "number" ? (style.weight as number) : 3,
      fillOpacity:
        typeof style.fillOpacity === "number" && !Number.isNaN(style.fillOpacity)
          ? Math.min(1, Math.max(0, style.fillOpacity as number))
          : 0.3,
    }
  }, [shape])

  const [name, setName] = useState(preset.name)
  const [description, setDescription] = useState(preset.description)
  const [category, setCategory] = useState(preset.category)
  const [zone, setZone] = useState(preset.zone)
  const [notes, setNotes] = useState(preset.notes)
  const [type, setType] = useState(preset.type)
  const [mouza, setMouza] = useState(preset.mouza)
  const [sector, setSector] = useState(preset.sector)
  const [society, setSociety] = useState(preset.society)
  const [landuse, setLanduse] = useState(preset.landuse)
  const [ownership, setOwnership] = useState(preset.ownership)
  const [color, setColor] = useState(preset.color)
  const [weight, setWeight] = useState<number>(preset.weight)
  const [fillOpacity, setFillOpacity] = useState<number>(preset.fillOpacity)

  const [hex, setHex] = useState<string>(preset.color)

  const handleHexChange = (v: string) => {
    setHex(v)
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
      setColor(v)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description,
      category,
      zone,
      notes,
      type,
      mouza,
      sector,
      society,
      landuse,
      ownership,
      style: {
        color,
        fillColor: color,
        weight,
        fillOpacity,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby="shape-edit-title" className="space-y-6">
      <h2 id="shape-edit-title" className="text-lg font-semibold">
        Edit “{shape.properties?.name || "Polygon"}”
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-required="true"
            placeholder="Polygon name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Residential"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone">Zone</Label>
          <Input id="zone" value={zone} onChange={(e) => setZone(e.target.value)} placeholder="e.g. ICT" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Residential" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mouza">Mouza</Label>
          <Input id="mouza" value={mouza} onChange={(e) => setMouza(e.target.value)} placeholder="Mouza name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector">Sector</Label>
          <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Sector name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="society">Society</Label>
          <Input id="society" value={society} onChange={(e) => setSociety(e.target.value)} placeholder="Society name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landuse">Land Use</Label>
          <Input id="landuse" value={landuse} onChange={(e) => setLanduse(e.target.value)} placeholder="Land use type" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownership">Ownership</Label>
          <Input id="ownership" value={ownership} onChange={(e) => setOwnership(e.target.value)} placeholder="Ownership type" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center gap-3">
            <input
              id="color"
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value)
                setHex(e.target.value)
              }}
              className="h-9 w-12 cursor-pointer rounded-md border p-1"
              aria-label="Pick color"
            />
            <Input
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              aria-label="Color hex"
              className="w-36"
              placeholder="#3388ff"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Stroke Weight: {weight}px</Label>
          <Slider
            id="weight"
            value={[weight]}
            onValueChange={(v) => setWeight(v[0] ?? 3)}
            min={1}
            max={10}
            step={1}
            aria-label="Stroke weight"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fillOpacity">Fill Opacity: {fillOpacity.toFixed(2)}</Label>
          <Slider
            id="fillOpacity"
            value={[fillOpacity]}
            onValueChange={(v) => setFillOpacity(v[0] ?? 0.3)}
            min={0}
            max={1}
            step={0.05}
            aria-label="Fill opacity"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Internal notes"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} aria-label="Cancel editing">
            Cancel
          </Button>
        ) : null}
        <Button type="submit" aria-label="Save changes">
          Save changes
        </Button>
      </div>
    </form>
  )
}
