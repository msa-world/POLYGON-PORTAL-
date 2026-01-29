'use client'

import { useState, useMemo } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { DATA_LAYERS, MOUZA_LAYERS } from '@/lib/constants/layers'

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredDataLayers = useMemo(() => {
    if (!debouncedSearchTerm) return DATA_LAYERS
    
    return DATA_LAYERS.filter(layer =>
      layer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [debouncedSearchTerm])

  const filteredMouzaLayers = useMemo(() => {
    if (!debouncedSearchTerm) return MOUZA_LAYERS
    
    return MOUZA_LAYERS.filter(layer =>
      layer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [debouncedSearchTerm])

  return {
    searchTerm,
    setSearchTerm,
    filteredDataLayers,
    filteredMouzaLayers
  }
}
