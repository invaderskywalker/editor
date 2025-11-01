import { createContext } from 'react';
import type { Socket } from 'socket.io-client';

export const SocketContext = createContext<React.MutableRefObject<Socket | null> | null>(null);
