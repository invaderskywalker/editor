/* eslint-disable @typescript-eslint/no-explicit-any */
// ====== ./src/components/Toolbar.tsx ======
import React from 'react';
import * as fabric from 'fabric';
import { useSocket } from '../hooks/useSocket';
import '../styles/ui-panels.css';

interface Props {
  canvas: React.MutableRefObject<fabric.Canvas | null>;
  undo: () => void;
  redo: () => void;
  exportPNG: () => void;
  designId: string;
}

const Toolbar: React.FC<Props> = ({ canvas, undo, redo, exportPNG, designId }) => {
  const socket = useSocket();

  const ensureCanvas = (): fabric.Canvas | null => {
    if (!canvas.current) {
      console.warn('Canvas not ready yet');
      return null;
    }
    return canvas.current;
  };

  const addText = () => {
    const c = ensureCanvas();
    if (!c) return;

    try {
      // Use Textbox for better cross-version compatibility
      const t = new fabric.IText('Double-click to edit', {
        left: 100,
        top: 100,
        fontSize: 30,
        fill: '#060606ff',
        opacity: 1,
        width: 300,
        editable: true,
      });

      console.log('Adding text to canvas (textbox):', t, 'canvas:', c);
      c.add(t);
      // Make sure the object is active and visible immediately
      c.setActiveObject(t);
      // enter editing mode so user can type immediately
      // guard for versions that may not have enterEditing
      if ((t as any).enterEditing) {
        (t as any).enterEditing();
        (t as any).selectAll?.();
      }
      // ensure the canvas re-renders
      c.requestRenderAll?.();
      c.renderAll?.();

      // Broadcast a single-object add if you want others to see it
      // socket.current?.emit('canvas:object:add', { designId, object: t.toObject() });
    } catch (err) {
      console.error('Failed to add text object:', err);
    }
  };

  const addRect = () => {
    const c = ensureCanvas();
    if (!c) return;
    const r = new fabric.Rect({
      left: 150,
      top: 150,
      width: 200,
      height: 120,
      fill: '#4caf50',
    });
    c.add(r);
    c.setActiveObject(r);
    c.requestRenderAll?.();
    c.renderAll?.();
    socket.current?.emit('canvas:object:add', { designId, object: r.toObject() });
  };

  const addCircle = () => {
    const c = ensureCanvas();
    if (!c) return;
    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 80,
      fill: '#ff9800',
    });
    c.add(circle);
    c.setActiveObject(circle);
    c.requestRenderAll?.();
    c.renderAll?.();
    socket.current?.emit('canvas:object:add', { designId, object: circle.toObject() });
  };

  const deleteSelected = () => {
    const c = ensureCanvas();
    if (!c) return;
    const active = c.getActiveObjects();
    if (active?.length) {
      active.forEach(obj => c.remove(obj));
      c.discardActiveObject();
      c.requestRenderAll?.();
      c.renderAll?.();
    }
    socket.current?.emit('canvas:update', { designId, canvas: c.toJSON() });
  };

  return (
    <div className="toolbar">
      <button onClick={addText} className="toolbar-btn toolbar-btn-blue">Text</button>
      <button onClick={addRect} className="toolbar-btn toolbar-btn-green">Rect</button>
      <button onClick={addCircle} className="toolbar-btn toolbar-btn-orange">Circle</button>
      <div className="toolbar-divider" />
      <button onClick={undo} className="toolbar-btn toolbar-btn-gray">Undo</button>
      <button onClick={redo} className="toolbar-btn toolbar-btn-gray">Redo</button>
      <div className="toolbar-divider" />
      <button onClick={deleteSelected} className="toolbar-btn toolbar-btn-red">Delete</button>
      <button onClick={exportPNG} className="toolbar-btn toolbar-btn-indigo">Export PNG</button>

    </div>
  );
};

export default Toolbar;
