/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCanvasData } from '../redux/designSlice';
import { useFabricCanvas } from '../hooks/useFabricCanvas';
import { useSocket } from '../hooks/useSocket';
import type { CanvasDataDTO } from '../api/api';

interface CanvasEditorProps {
  canvasData: CanvasDataDTO | null;
  onCanvasChange: (data: CanvasDataDTO) => void;
}

const CANVAS_ID = 'fabric-canvas';
const SOCKET_URL = 'http://localhost:5001'; // Adjust for your backend

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  canvasData,
  onCanvasChange,
}) => {
  const dispatch = useDispatch();
  const canvasRef = useFabricCanvas(CANVAS_ID);
  const socketRef = useSocket(SOCKET_URL);

  // 🧠 Load existing canvas data into Fabric when it changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasData) return;

    canvas.loadFromJSON(canvasData, () => {
      canvas.renderAll();
    });
  }, [canvasData, canvasRef]);

  // 🧩 Real-time socket updates
  useEffect(() => {
    const socket = socketRef.current;
    const canvas = canvasRef.current;

    if (!socket || !canvas) return;

    // When receiving updates from others
    socket.on('canvas_update', (newData: CanvasDataDTO) => {
      canvas.loadFromJSON(newData, () => canvas.renderAll());
      dispatch(setCanvasData(newData));
    });

    // When local canvas changes
    const onModified = () => {
      const newData = canvas.toJSON();
      socket.emit('canvas_update', newData);
      onCanvasChange(newData as CanvasDataDTO);
    };

    canvas.on('object:modified', onModified);
    canvas.on('object:added', onModified);

    return () => {
      socket.off('canvas_update');
      canvas.off('object:modified', onModified);
      canvas.off('object:added', onModified);
    };
  }, [socketRef, canvasRef, dispatch, onCanvasChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasData) return;

    try {
      canvas.loadFromJSON(canvasData, () => {
        canvas.renderAll();
      });
    } catch (err) {
      console.error('Error loading canvas data:', err);
    }
  }, [canvasData, canvasRef]);


  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50">
      <canvas
        id={CANVAS_ID}
        width={1000}
        height={600}
        className="border border-gray-300 rounded shadow"
      />
    </div>
  );
};

export default CanvasEditor;
