/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/CanvasEditor.tsx
import React, { useEffect, useRef } from 'react';
import { useFabricCanvas } from '../hooks/useFabricCanvas';
import { useSocket } from '../hooks/useSocket';
import { updateDesign } from '../api/api';
import Toolbar from './Toolbar';

interface Props {
  designId: string;
  canvasData: any;
}

const CANVAS_ID = 'fabric-canvas';
const SOCKET_URL = 'http://localhost:5001';
const CANVAS_SIZE = { width: 1080, height: 1080 };

const CanvasEditor: React.FC<Props> = ({ designId, canvasData }) => {
  const canvas = useFabricCanvas(CANVAS_ID);
  const socket = useSocket(SOCKET_URL);
  const saveTimeout = useRef<any>(null);

  // History
  const history = useRef<string[]>([]);
  const historyStep = useRef<number>(-1);
  const MAX_HISTORY = 20;

  const pushHistory = () => {
    if (!canvas.current) return;
    const json = JSON.stringify(canvas.current.toJSON());
    if (historyStep.current >= 0 && history.current[historyStep.current] === json) return;
    history.current = history.current.slice(0, historyStep.current + 1);
    history.current.push(json);
    if (history.current.length > MAX_HISTORY) history.current.shift();
    historyStep.current = history.current.length - 1;
  };

  const undo = () => {
    if (historyStep.current <= 0 || !canvas.current) return;
    historyStep.current--;
    const state = JSON.parse(history.current[historyStep.current]);
    canvas.current.loadFromJSON(state, () => canvas.current?.renderAll());
  };

  const redo = () => {
    if (historyStep.current >= history.current.length - 1 || !canvas.current) return;
    historyStep.current++;
    const state = JSON.parse(history.current[historyStep.current]);
    canvas.current.loadFromJSON(state, () => canvas.current?.renderAll());
  };

  const exportPNG = () => {
    if (!canvas.current) return;
    const dataURL = canvas.current.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'design.png';
    link.click();
  };

  // Set canvas size
  useEffect(() => {
    if (canvas.current) {
      canvas.current.setDimensions(CANVAS_SIZE);
    }
  }, [canvas]);

  // Load canvas
  useEffect(() => {
    if (!canvas.current || !canvasData) return;
    canvas.current.loadFromJSON(canvasData, () => {
      canvas.current?.renderAll();
      pushHistory();
    });
  }, [canvasData, canvas]);

  // Broadcast changes
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;

    const onChange = () => {
      const json = c.toJSON();
      socket.current?.emit('design:update', { designId, canvas: json });
      pushHistory();

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        updateDesign(designId, { canvas: json });
      }, 1000);
    };

    c.on('object:modified', onChange);
    c.on('object:added', onChange);
    c.on('object:removed', onChange);

    return () => {
      c.off('object:modified', onChange);
      c.off('object:added', onChange);
      c.off('object:removed', onChange);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [canvas, socket, designId]);

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      <Toolbar canvas={canvas} undo={undo} redo={redo} exportPNG={exportPNG} />
      <div className="flex-1 flex justify-center items-center p-4 overflow-auto">
        <canvas id={CANVAS_ID} className="border border-gray-300 rounded shadow-lg bg-white" />
      </div>
    </div>
  );
};

export default CanvasEditor;