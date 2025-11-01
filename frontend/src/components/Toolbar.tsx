import React from 'react';
import * as fabric from 'fabric';
import { useSocket } from '../hooks/useSocket';
import '../../styles/ui-panels.css';

interface Props {
  canvas: React.MutableRefObject<fabric.Canvas | null>;
  undo: () => void;
  redo: () => void;
  exportPNG: () => void;
  designId: string;
}

const Toolbar: React.FC<Props> = ({ canvas, undo, redo, exportPNG, designId }) => {
  const socket = useSocket();

  const broadcast = () => {
    const json = canvas.current?.toJSON();
    socket.current?.emit('canvas:update', { designId, canvas: json });
  };

  const addText = () => {
    if (!canvas.current) return;
    const t = new fabric.IText('Double-click to edit', { left: 100, top: 100, fontSize: 30, fill: '#333' });
    canvas.current.add(t);
    canvas.current.setActiveObject(t);
    canvas.current.renderAll();
    // broadcast();
  };

  const addRect = () => {
    if (!canvas.current) return;
    const r = new fabric.Rect({ left: 150, top: 150, width: 200, height: 120, fill: '#4caf50' });
    canvas.current.add(r);
    canvas.current.setActiveObject(r);
    canvas.current.renderAll();
    // broadcast();
  };

  const addCircle = () => {
    if (!canvas.current) return;
    const c = new fabric.Circle({ left: 200, top: 200, radius: 80, fill: '#ff9800' });
    canvas.current.add(c);
    canvas.current.setActiveObject(c);
    canvas.current.renderAll();
    // broadcast();
  };

  const deleteSelected = () => {
    const active = canvas.current?.getActiveObjects();
    if (active?.length) {
      active.forEach(obj => canvas.current?.remove(obj));
      canvas.current?.discardActiveObject();
      canvas.current?.renderAll();
    }
    // broadcast();
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