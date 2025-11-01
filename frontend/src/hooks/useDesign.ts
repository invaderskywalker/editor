/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { getDesign, createDesign } from '../api/api';
import { useSocket } from './useSocket';

export function useDesign(designId?: string) {
  const [design, setDesign] = useState<any>(null);
  const [layers, setLayers] = useState<any[]>([]);
  const [canvas, setCanvas] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    const load = async () => {
      let id = designId;
      const validId = /^[0-9a-fA-F]{24}$/.test(id || '');

      if (!id || !validId) {
        const newDesign = await createDesign('Untitled');
        id = newDesign._id;
        window.history.replaceState(null, '', `/?id=${id}`);
      }

      const data = await getDesign(id!);
      setDesign(data);
      setLayers(data.layers ?? []);
      setCanvas(data.canvas ?? { version: '5.3.0', objects: [] });
      setComments(data.comments ?? []);

      // Join room
      socket.current?.emit('design:join', { designId: id });

      // ---------- LISTEN ----------
      const s = socket.current!;
      s.on('design:load', (d) => {
        setLayers(d.layers ?? []);
        setCanvas(d.canvas ?? { version: '5.3.0', objects: [] });
        setComments(d.comments ?? []);
      });

      s.on('canvas:update', ({ canvas: c }) => {
        setCanvas(c);
        // Optional: force re-render
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
      });

      s.on('layer:added', ({ layer }) => {
        setLayers(p => p.some(l => l._id === layer._id) ? p : [...p, layer]);
      });
      s.on('layer:deleted', ({ layerId }) => {
        setLayers(p => p.filter(l => l._id !== layerId));
      });
      s.on('layers:replace', ({ layers: l }) => setLayers(l));

      // s.on('canvas:update', ({ canvas: c }) => setCanvas(c));
      s.on('comment:added', ({ comment }) => setComments(p => [...p, comment]));

      setLoading(false);
    };

    load();

    return () => {
      socket.current?.off();
    };
  }, [designId, socket]);

  const appendCommentLocal = (c: any) => setComments(p => [...p, c]);

  return { design, layers, canvas, comments, loading, designId: design?._id, appendCommentLocal };
}