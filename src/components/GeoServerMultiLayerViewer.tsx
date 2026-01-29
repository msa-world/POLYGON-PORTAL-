import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import OSM from "ol/source/OSM";
import ImageWMS from "ol/source/ImageWMS";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import { MOUZA_LAYERS } from "@/lib/constants/layers"; // <-- Import Mouza layers

const BBOX_API = "https://rda.ngrok.app/get_bbox";
const MAP_API = "https://rda.ngrok.app/get_map";

export default function GeoServerMultiLayerViewer() {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const currentLayerRef = useRef(null);

  const [coords, setCoords] = useState({ lon: "--", lat: "--" });

  useEffect(() => {
    if (!mapElRef.current) return;

    const map = new Map({
      target: mapElRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([73, 31]),
        zoom: 6,
      }),
    });

    mapRef.current = map;

    setTimeout(() => map.updateSize(), 200);

    const clickHandler = (evt) => {
      const [lon, lat] = toLonLat(evt.coordinate);
      setCoords({ lon: lon.toFixed(6), lat: lat.toFixed(6) });
    };
    map.on("click", clickHandler);

    const moveEndHandler = () => {
      const center = map.getView().getCenter();
      if (!center) return;
      const [lon, lat] = toLonLat(center);
      setCoords({ lon: lon.toFixed(6), lat: lat.toFixed(6) });
    };
    map.on("moveend", moveEndHandler);

    return () => {
      map.un("click", clickHandler);
      map.un("moveend", moveEndHandler);
      map.setTarget(undefined);
      mapRef.current = null;
      currentLayerRef.current = null;
    };
  }, []);

  async function toggleLayer(layerId) {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous layer if any
    if (currentLayerRef.current) {
      map.removeLayer(currentLayerRef.current);
      currentLayerRef.current = null;
    }

    try {
      const response = await fetch(`${BBOX_API}?layer=${encodeURIComponent(layerId)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const layerInfo = data?.[layerId];

      if (!layerInfo || !layerInfo.default_bbox) {
        alert(`Layer not found or no bbox in API: ${layerId}`);
        return;
      }

      const b = layerInfo.default_bbox;
      const extentNative = [b.minx, b.miny, b.maxx, b.maxy];
      const srcCrs = b.crs || "EPSG:32643";
      const extent3857 = transformExtent(extentNative, srcCrs, "EPSG:3857");

      const imageLayer = new ImageLayer({
        source: new ImageWMS({
          url: MAP_API,
          params: {
            LAYERS: layerId,
            VERSION: "1.1.0",
            FORMAT: "image/png",
            TRANSPARENT: "true",
          },
          ratio: 1,
          serverType: "geoserver",
        }),
      });

      map.addLayer(imageLayer);
      currentLayerRef.current = imageLayer;

      map.getView().fit(extent3857, {
        size: map.getSize() || undefined,
        duration: 1000,
        maxZoom: 17,
      });
    } catch (err) {
      console.error("Failed to fetch bbox:", err);
      alert(`Error fetching bbox for ${layerId}`);
    }
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Map container */}
      <div ref={mapElRef} id="map" style={{ width: "100%", height: "100%" }} />

      {/* Coordinates display */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          backgroundColor: "white",
          borderRadius: "6px",
          padding: "8px 12px",
          fontSize: "14px",
          fontFamily: "monospace",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        Longitude: {coords.lon}, Latitude: {coords.lat}
      </div>

      {/* Dynamic Mouza Layer Buttons */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          zIndex: 1000,
          maxHeight: "80vh",
          overflowY: "auto",
          width: "320px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Mouza Layers</div>
        {MOUZA_LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            style={{
              display: "block",
              marginBottom: "6px",
              padding: "6px 12px",
              border: "1px solid #aaa",
              borderRadius: "5px",
              background: "white",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            {layer.name}
          </button>
        ))}
      </div>
    </div>
  );
}
