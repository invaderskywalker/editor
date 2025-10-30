/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../redux/store';
import { setCanvasData } from '../redux/designSlice';
import { useFabricCanvas } from '../hooks/useFabricCanvas';
import { useSocket } from '../hooks/useSocket';
// import { fetchCanvasData } from '../api/api'; // Uncomment when API ready

const CANVAS_ID = 'fabric-canvas';
const SOCKET_URL = 'http://localhost:4000'; // Placeholder, adjust as needed

const CanvasEditor: React.FC = () => {
  const dispatch = useDispatch();
  const canvasData = useSelector((state: RootState) => state.design.canvasData);
  const canvasRef = useFabricCanvas(CANVAS_ID);
  const socketRef = useSocket(SOCKET_URL);

  // ✅ Load initial canvas data (future API integration)
  useEffect(() => {
    // Example: load saved design when backend is ready
    // fetchCanvasData().then((data) => dispatch(setCanvasData(data)));
  }, [dispatch]);

  // ✅ Real-time sync (Socket.io)
  useEffect(() => {
    const socket = socketRef.current;
    const canvas = canvasRef.current;

    if (!socket || !canvas) return;

    // Listen for canvas updates
    socket.on('canvas_update', (newData: unknown) => {
      if (newData) dispatch(setCanvasData(newData as any)); // TODO: type properly
    });

    // Broadcast when local changes occur
    const onModified = () => {
      socket.emit('canvas_update', canvas.toJSON());
    };

    canvas.on('object:modified', onModified);
    canvas.on('object:added', onModified);

    // Cleanup listeners on unmount
    return () => {
      socket.off('canvas_update');
      canvas.off('object:modified', onModified);
      canvas.off('object:added', onModified);
    };
  }, [socketRef, canvasRef, dispatch]);

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
