import type { DrawnShape } from "@/lib/types/shape"

export function exportToGeoJSON(shapes: DrawnShape[]) {
    const features = shapes.map((shape) => {
        let geometry: any
        if (shape.type === "polygon") {
            // GeoJSON expects [lng, lat]
            const coords = [...shape.coordinates, shape.coordinates[0]].map((c: any) => [c.lng, c.lat])
            geometry = { type: "Polygon", coordinates: [coords] }
        } else if (shape.type === "circle") {
            // Point for circle
            geometry = { type: "Point", coordinates: [shape.coordinates[0].lng, shape.coordinates[0].lat] }
        }

        return {
            type: "Feature",
            properties: {
                id: shape.id,
                name: shape.name,
                description: shape.type,
                area: shape.area,
                radius: shape.radius,
            },
            geometry,
        }
    })

    return JSON.stringify({ type: "FeatureCollection", features }, null, 2)
}

export function exportToKMZ(shapes: DrawnShape[]) {
    // Basic KML generation
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Exported Shapes</name>
`
    shapes.forEach(shape => {
        kml += `    <Placemark>
      <name>${shape.name}</name>
      <description>${shape.type} - Area: ${Math.round(shape.area || 0)} sq m</description>
`
        if (shape.type === 'polygon') {
            const coords = [...shape.coordinates, shape.coordinates[0]]
                .map((c: any) => `${c.lng},${c.lat},0`)
                .join(' ')
            kml += `      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coords}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
`
        } else {
            // Circle as Point (KML doesn't support circles natively well without extensions)
            kml += `      <Point>
        <coordinates>${shape.coordinates[0].lng},${shape.coordinates[0].lat},0</coordinates>
      </Point>
`
        }
        kml += `    </Placemark>
`
    })
    kml += `  </Document>
</kml>`
    return kml
}
