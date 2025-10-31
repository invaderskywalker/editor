// src/hooks/useFabricCanvas.ts
import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

export function useFabricCanvas(canvasId: string) {
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvasElem = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (canvasElem && !canvasRef.current) {
      canvasRef.current = new fabric.Canvas(canvasId, {
        width: 1080,
        height: 1080,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      });

      // Show handles on selection
      canvasRef.current.on('selection:created', () => canvasRef.current?.renderAll());
      canvasRef.current.on('selection:updated', () => canvasRef.current?.renderAll());
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, [canvasId]);

  return canvasRef;
}