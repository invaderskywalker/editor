import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(url: string, opts?: object) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect only once
    socketRef.current = io(url, opts);
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [url]);

  return socketRef;
}
