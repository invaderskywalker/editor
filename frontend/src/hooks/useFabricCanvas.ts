import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

export function useFabricCanvas(canvasId: string) {
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvasElem = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (canvasElem && !canvasRef.current) {
      canvasRef.current = new fabric.Canvas(canvasId, {
        width: 1000,
        height: 600,
        backgroundColor: '#fff',
      });
    }

    return () => {
      if (canvasRef.current) {
        // dispose safely
        try {
          canvasRef.current.dispose();
        } catch (err) {
          console.warn('Error disposing Fabric canvas:', err);
        }
        canvasRef.current = null;
      }
    };
  }, [canvasId]);

  return canvasRef;
}
