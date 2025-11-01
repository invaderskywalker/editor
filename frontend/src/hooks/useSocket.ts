import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:5001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(URL, { transports: ['websocket'] });
    return () => socketRef.current?.disconnect();
  }, []);

  return socketRef;
}