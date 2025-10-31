/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useDesign.ts
import { useEffect, useState } from 'react';
import { getDesign, createDesign } from '../api/api';
import { useSocket } from './useSocket';

const SOCKET_URL = 'http://localhost:5001';

export function useDesign(designId?: string) {
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket(SOCKET_URL);

  useEffect(() => {
    const load = async () => {
      try {
        let id = designId;
        if (!id) {
          const newDesign = await createDesign('Untitled Design');
          id = newDesign._id;
          window.history.replaceState(null, '', `/?id=${id}`);
        }
        if (id) {
            const data = await getDesign(id);
            setDesign(data);
            // Join room
            socket.current?.emit('design:join', { designId: id });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [designId, socket]);

  return { design, loading, designId: design?._id };
}