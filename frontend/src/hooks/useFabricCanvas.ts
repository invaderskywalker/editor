import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

export function useFabricCanvas(canvasId: string) {
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      const canvasElem = document.getElementById(canvasId) as HTMLCanvasElement | null;
      if (canvasElem) {
        // Initialize canvas and store reference
        canvasRef.current = new fabric.Canvas(canvasId, {
          width: 800,
          height: 600,
          backgroundColor: '#fff',
        });
      }
    }
    return () => {
      // Dispose fabric canvas on cleanup
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, [canvasId]);

  return canvasRef;
}
