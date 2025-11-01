/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import * as fabric from 'fabric';
import '../../styles/ui-panels.css';

interface Props {
  canvas: React.MutableRefObject<fabric.Canvas | null>;
  undo: () => void;
  redo: () => void;
  exportPNG: () => void;
}

const Toolbar: React.FC<Props> = ({ canvas, undo, redo, exportPNG }) => {
  // Removed unused useDispatch and dispatch

  const addText = () => {
    const text = new fabric.IText('Double-click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 30,
      fill: '#333333',
    });
    canvas.current?.add(text);
    canvas.current?.setActiveObject(text);
  };

  const addRect = () => {
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      width: 200,
      height: 120,
      fill: '#4caf50',
      stroke: '#2e7d32',
      strokeWidth: 2,
    });
    canvas.current?.add(rect);
    canvas.current?.setActiveObject(rect);
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 80,
      fill: '#ff9800',
      stroke: '#e65100',
      strokeWidth: 2,
    });
    canvas.current?.add(circle);
    canvas.current?.setActiveObject(circle);
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (!url) return;
    fabric.Image.fromURL(url, (img: fabric.Image) => {
      img.scaleToWidth(200);
      canvas.current?.add(img);
      canvas.current?.setActiveObject(img);
    });
  };

  const deleteSelected = () => {
    const active = canvas.current?.getActiveObjects();
    if (active) {
      canvas.current?.remove(...active);
      canvas.current?.discardActiveObject();
    }
  };

  return (
    <div className="toolbar">
      <button onClick={addText} className="toolbar-btn toolbar-btn-blue">
        Text
      </button>
      <button onClick={addRect} className="toolbar-btn toolbar-btn-green">
        Rectangle
      </button>
      <button onClick={addCircle} className="toolbar-btn toolbar-btn-orange">
        Circle
      </button>
      <button onClick={addImage} className="toolbar-btn toolbar-btn-purple">
        Image
      </button>
      <div className="toolbar-divider" />
      <button onClick={undo} className="toolbar-btn toolbar-btn-gray">
        Undo
      </button>
      <button onClick={redo} className="toolbar-btn toolbar-btn-gray">
        Redo
      </button>
      <div className="toolbar-divider" />
      <button onClick={deleteSelected} className="toolbar-btn toolbar-btn-red">
        Delete
      </button>
      <button onClick={exportPNG} className="toolbar-btn toolbar-btn-indigo">
        Export PNG
      </button>
    </div>
  );
};

export default Toolbar;
