"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface LayerPanelContextType {
  dataLayersOpen: boolean
  setDataLayersOpen: (open: boolean) => void
  mouzaLayersOpen: boolean
  setMouzaLayersOpen: (open: boolean) => void
  mouzaGroupOpen: string | null
  setMouzaGroupOpen: (id: string | null) => void
  imageryOpen: boolean
  setImageryOpen: (open: boolean) => void
}

const LayerPanelContext = createContext<LayerPanelContextType | undefined>(undefined)

export function useLayerPanel() {
  const ctx = useContext(LayerPanelContext)
  if (!ctx) throw new Error("useLayerPanel must be used within a LayerPanelProvider")
  return ctx
}

export function LayerPanelProvider({ children }: { children: ReactNode }) {
  const [dataLayersOpen, setDataLayersOpen] = useState(false)
  const [mouzaLayersOpen, setMouzaLayersOpen] = useState(false)
  const [mouzaGroupOpen, setMouzaGroupOpen] = useState<string | null>(null)
  const [imageryOpen, setImageryOpen] = useState(false)

  return (
    <LayerPanelContext.Provider
      value={{
        dataLayersOpen,
        setDataLayersOpen,
        mouzaLayersOpen,
        setMouzaLayersOpen,
        mouzaGroupOpen,
        setMouzaGroupOpen,
        imageryOpen,
        setImageryOpen,
      }}
    >
      {children}
    </LayerPanelContext.Provider>
  )
}
