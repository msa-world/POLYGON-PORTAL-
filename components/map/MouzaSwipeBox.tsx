import React, { useState, useRef, useEffect } from 'react';
import { useRaster } from '@/hooks/use-raster';
import { createPortal } from 'react-dom';

// MouzaSwipeBox overlays a draggable slider box on the map and hides Mouza raster from that position
export default function MouzaSwipeBox() {
  const { activeRasters } = useRaster();
  const isActive = activeRasters.size > 0;
  const [position, setPosition] = useState(50); // percent
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  // Find map container and keep ref
  useEffect(() => {
    let mapContainer = document.querySelector('.leaflet-container') as HTMLElement | null;
    if (!mapContainer) {
      mapContainer = document.getElementById('map') as HTMLElement | null;
    }
    containerRef.current = mapContainer;
  }, [isActive]);

  // Apply clip-path to Mouza raster canvas
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const canvases = containerRef.current.querySelectorAll('canvas');
    if (canvases.length > 0) {
      canvases.forEach((canvas: any) => {
        canvas.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
      });
    } else {
      // Fallback: show a visible box overlay if no raster canvas found
      // This will be handled in the render below
    }
    return () => {
      canvases.forEach((canvas: any) => {
        canvas.style.clipPath = '';
      });
    };
  }, [isActive, position]);

  // --- Drag logic (mouse/touch) ---
  useEffect(() => {
    // Mouse move
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      let newPosition = ((e.clientX - left) / width) * 100;
      newPosition = Math.max(0, Math.min(100, newPosition));
      setPosition(newPosition);
    };
    // Mouse up
    const onMouseUp = () => setIsDragging(false);
    // Touch move
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      if (e.touches.length > 0) {
        const { left, width } = containerRef.current.getBoundingClientRect();
        let newPosition = ((e.touches[0].clientX - left) / width) * 100;
        newPosition = Math.max(0, Math.min(100, newPosition));
        setPosition(newPosition);
      }
    };
    // Touch end
    const onTouchEnd = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
      document.addEventListener('touchcancel', onTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isDragging]);

  // Render slider in map container using portal
  if (!isActive || !containerRef.current) return null;
  const portalTarget = containerRef.current;

  return createPortal(
    <>
      {/* Main slider box overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${position}%`,
          height: '100%',
          width: '0',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        {/* Vertical slider line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '4px',
            background: 'rgba(52,211,153,0.9)',
            boxShadow: '0 0 12px #34d399',
            pointerEvents: 'none',
            borderRadius: '2px',
          }}
        />
        {/* Slider handle (draggable box) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '-18px',
            transform: 'translateY(-50%)',
            width: '36px',
            height: '56px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(52,211,153,0.4)',
            border: '3px solid #34d399',
            cursor: 'ew-resize',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'box-shadow 0.2s',
            pointerEvents: 'auto',
          }}
          title="Drag to hide/reveal Mouza"
          onMouseDown={e => { e.preventDefault(); setIsDragging(true); }}
          onTouchStart={e => { e.preventDefault(); setIsDragging(true); }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="11" y="4" width="2" height="16" rx="1" fill="#34d399" />
            <rect x="4" y="11" width="16" height="2" rx="1" fill="#34d399" />
          </svg>
          <span style={{marginTop: 2, fontSize: 18, color: '#34d399', fontWeight: 600}}>&#x2194;</span>
          <span style={{marginTop: 2, fontSize: 12, color: '#34d399'}}>Swipe</span>
        </div>
      </div>
      {/* Fallback: if no raster canvas, show a visible box overlay for debug */}
      {containerRef.current && containerRef.current.querySelectorAll('canvas').length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${position}%`,
            height: '100%',
            width: '36px',
            background: 'rgba(52,211,153,0.2)',
            border: '2px dashed #34d399',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <span style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#34d399', fontWeight: 600}}>No Raster</span>
        </div>
      )}
    </>,
    portalTarget
  );
}
