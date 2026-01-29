import { MOUZA_LAYERS, DATA_LAYERS } from '@/lib/constants/layers'

// Example usage: when a user selects a layer to display
// layerId: string from user selection (e.g., dropdown or button)
// map: your OpenLayers map instance

async function onLayerSelect(layerId: string, map: ol.Map) {
  await toggleLayer(layerId, map, MOUZA_LAYERS, DATA_LAYERS)
}

// Example: Hook up to a dropdown
document.getElementById('layerDropdown').addEventListener('change', (e) => {
  const layerId = (e.target as HTMLSelectElement).value
  onLayerSelect(layerId, map)
})
