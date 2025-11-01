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
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    const socket = socketRef.current;

    const load = async () => {
      try {
        let id = designId;

        // ---------- FIX: More lenient ID check ----------
        const isValidMongoId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);
        if (!id || !isValidMongoId(id)) {
          console.log('Creating new design (ID invalid or missing):', id);
          const newDesign = await createDesign('Untitled');
          id = newDesign._id;
          window.history.replaceState(null, '', `/?id=${id}`);
        } else {
          console.log('Loading existing design:', id);
        }
        if (id) {
          const data = await getDesign(id);
          console.log('Loaded design:', data); // Debug log
          setDesign(data);
          setLayers(data.layers || []);
          setCanvas(data.canvas || { version: '5.3.0', objects: [] });
          setComments(data.comments || []);

          // Join room
          socket.emit('design:join', { designId: id });
          console.log('Joined room for design:', id); // Debug log
        }

        // Listen for all relevant socket events
        socket.on('layer:added', ({ layer }) => {
          setLayers(prev => {
            if (prev.some(l => l._id === layer._id)) return prev;
            return [...prev, layer];
          });
        });

        socket.on('layer:updated', ({ layers: newLayers }) => {
          setLayers(newLayers);
        });
        socket.on('layer:deleted', ({ layerId }) => {
          setLayers(prev => prev.filter(l => l._id !== layerId));
        });
        socket.on('layers:reordered', ({ layers: newLayers }) => {
          setLayers(newLayers);
        });

        socket.on('design:update', ({ canvas: newCanvas }) => {
          setCanvas(newCanvas);
        });

        socket.on('comment:added', ({ comment }) => {
          setComments(prev => [...prev, comment]);
        });

      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      socket.off('layer:added');
      socket.off('layer:updated');
      socket.off('layer:deleted');
      socket.off('layers:reordered');
      socket.off('design:update');
      socket.off('comment:added');
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [designId]);

  // For external use: allow mutation of comments
  const appendCommentLocal = (comment: any) => setComments(prev => [...prev, comment]);

  return { design, layers, canvas, loading, designId: design?._id, comments, appendCommentLocal };
}
