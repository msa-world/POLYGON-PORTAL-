"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { GlassAlert, GlassAlertType } from "./glass-alert"

interface GlassToast {
  id: number
  type: GlassAlertType
  message: string
  title?: string
  duration?: number
  onClose?: () => void
}

let toastId = 0

const GlassToastContext = React.createContext<{
  notify: (toast: Omit<GlassToast, "id">) => void
} | null>(null)

export function useGlassToast() {
  const ctx = React.useContext(GlassToastContext)
  if (!ctx) throw new Error("useGlassToast must be used within GlassToastProvider")
  return ctx
}

export function GlassToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<GlassToast[]>([])

  const notify = React.useCallback((toast: Omit<GlassToast, "id">) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { ...toast, id }])
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        toast.onClose?.()
      }, toast.duration || 3200)
    }
  }, [])

  return (
    <GlassToastContext.Provider value={{ notify }}>
      {children}
      {createPortal(
        <div className="fixed top-8 right-8 z-[9999] flex flex-col gap-3">
          {toasts.map((toast) => (
            <GlassAlert
              key={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              show
            />
          ))}
        </div>,
        typeof window !== "undefined" ? document.body : ({} as any)
      )}
    </GlassToastContext.Provider>
  )
}
