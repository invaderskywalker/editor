/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useDesign.ts
import { useEffect, useState, useRef } from 'react';
import { getDesign, createDesign } from '../api/api';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

export function useDesign(designId?: string) {
  const [design, setDesign] = useState<any>(null);
  const [layers, setLayers] = useState<any[]>([]);
  const [canvas, setCanvas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    const socket = socketRef.current;

    const load = async () => {
      try {
        let id = designId;
        if (!id) {
          const newDesign = await createDesign('Untitled');
          id = newDesign._id;
          window.history.replaceState(null, '', `/?id=${id}`);
        }
        if (id) {
          const data = await getDesign(id);
          setDesign(data);
          setLayers(data.layers || []);
          setCanvas(data.canvas || { version: '5.3.0', objects: [] });

          socket.emit('design:join', { designId: id });
        }

        // Listen for layer add
        socket.on('layer:added', ({ layer }) => {
          setLayers(prev => {
            if (prev.some(l => l._id === layer._id)) return prev;
            return [...prev, layer];
          });
        });

        // Listen for canvas update
        socket.on('design:update', ({ canvas: newCanvas }) => {
          setCanvas(newCanvas);
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      socket.off('layer:added');
      socket.off('design:update');
      socket.disconnect();
    };
  }, [designId]);

  return { design, layers, canvas, loading, designId: design?._id };
}