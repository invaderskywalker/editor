/* eslint-disable @typescript-eslint/no-explicit-any */
// ====== ./src/hooks/useFabricCanvas.ts ======
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

export function useFabricCanvas(containerId: string) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || canvasRef.current) return;

    // Create a canvas element dynamically
    const canvasElem = document.createElement("canvas");
    container.appendChild(canvasElem);

    const c = new fabric.Canvas(canvasElem, {
      width: 512,
      height: 512,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    // Force upper/lower layering
    const lowers = container.querySelectorAll("canvas.lower-canvas");
    const uppers = container.querySelectorAll("canvas.upper-canvas");
    lowers.forEach(el => (el as HTMLCanvasElement).style.zIndex = "1");
    uppers.forEach(el => (el as HTMLCanvasElement).style.zIndex = "3");

    canvasRef.current = c;
    (window as any).__canvas__ = c;
    console.log("✅ Fabric initialized", c);

    setReady(true);

    return () => {
      c.dispose();
      canvasRef.current = null;
      container.innerHTML = "";
      setReady(false);
    };
  }, [containerId]);

  return { canvasRef, ready };
}
