/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import { useFabricCanvas } from '../hooks/useFabricCanvas';
import { useSocket } from '../hooks/useSocket';
import { updateDesign } from '../api/api';
import Toolbar from './Toolbar';
import '../CanvasEditor.css';
import '../../styles/ui-panels.css';

interface Props {
  designId: string;
  canvasData: any;
}

const CANVAS_ID = 'fabric-canvas';
const CANVAS_SIZE = { width: 1080, height: 1080 };

const CanvasEditor: React.FC<Props> = ({ designId, canvasData }) => {
  const canvas = useFabricCanvas(CANVAS_ID);
  const socket = useSocket();
  const saveTimeout = useRef<any>(null);

  // ---------- History ----------
  const history = useRef<string[]>([]);
  const step = useRef(-1);
  const MAX = 20;

  const push = () => {
    if (!canvas.current) return;
    const json = JSON.stringify(canvas.current.toJSON());
    if (step.current >= 0 && history.current[step.current] === json) return;
    history.current = history.current.slice(0, step.current + 1);
    history.current.push(json);
    if (history.current.length > MAX) history.current.shift();
    step.current = history.current.length - 1;
  };

  const undo = () => {
    if (step.current <= 0 || !canvas.current) return;
    step.current--;
    canvas.current.loadFromJSON(JSON.parse(history.current[step.current]), () => canvas.current?.renderAll());
  };

  const redo = () => {
    if (step.current >= history.current.length - 1 || !canvas.current) return;
    step.current++;
    canvas.current.loadFromJSON(JSON.parse(history.current[step.current]), () => canvas.current?.renderAll());
  };

  const exportPNG = () => {
    const url = canvas.current?.toDataURL({ format: 'png', multiplier: 2 });
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.png';
    a.click();
  };

  // ---------- Canvas size ----------
  useEffect(() => {
    canvas.current?.setDimensions(CANVAS_SIZE);
  }, [canvas]);

  // ---------- Load ----------
  useEffect(() => {
    if (!canvas.current || !canvasData) return;
    canvas.current.loadFromJSON(canvasData, () => {
      canvas.current?.renderAll();
      push();
    });
  }, [canvasData, canvas]);

  // ---------- Broadcast ----------
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;

    const broadcast = () => {
      const json = c.toJSON();
      socket.current?.emit('canvas:update', { designId, canvas: json });
      push();

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        updateDesign(designId, { canvas: json }).catch(console.error);
      }, 1000);
    };

    c.on('object:modified', broadcast);
    c.on('object:added', broadcast);
    c.on('object:removed', broadcast);

    return () => {
      c.off('object:modified', broadcast);
      c.off('object:added', broadcast);
      c.off('object:removed', broadcast);
    };
  }, [canvas, socket, designId]);

  return (
    <div className="canvas-editor-wrapper">
      <Toolbar canvas={canvas} undo={undo} redo={redo} exportPNG={exportPNG} designId={designId} />
      <div className="canvas-editor-center">
        <canvas id={CANVAS_ID} className="ui-canvas-frame" />
      </div>
    </div>
  );
};

export default CanvasEditor;
