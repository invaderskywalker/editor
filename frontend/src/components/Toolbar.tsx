/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Toolbar.tsx
import React from 'react';
import * as fabric from 'fabric';
import { useDispatch } from 'react-redux';
import { setCanvasData } from '../redux/designSlice';

interface Props {
  canvas: React.MutableRefObject<fabric.Canvas | null>;
  undo: () => void;
  redo: () => void;
  exportPNG: () => void;
}

const Toolbar: React.FC<Props> = ({ canvas, undo, redo, exportPNG }) => {
  const dispatch = useDispatch();

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
    fabric.Image.fromURL(url, (img) => {
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
    <div className="flex items-center gap-2 p-3 bg-white border-b shadow-sm flex-wrap">
      <button onClick={addText} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
        Text
      </button>
      <button onClick={addRect} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">
        Rectangle
      </button>
      <button onClick={addCircle} className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
        Circle
      </button>
      <button onClick={addImage} className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
        Image
      </button>

      <div className="w-px h-8 bg-gray-300 mx-2" />

      <button onClick={undo} className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
        Undo
      </button>
      <button onClick={redo} className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
        Redo
      </button>

      <div className="w-px h-8 bg-gray-300 mx-2" />

      <button onClick={deleteSelected} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700">
        Delete
      </button>
      <button onClick={exportPNG} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
        Export PNG
      </button>
    </div>
  );
};

export default Toolbar;