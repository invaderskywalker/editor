// SocketServer for collaborative events using Socket.io
import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

export function initSocketServer(httpServer: HttpServer) {
  const io = new IOServer(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    // Placeholder for design/layer/comment update events
    socket.on('design:update', (data) => {
      // Broadcast updated design to collaborators
      socket.broadcast.emit('design:update', data);
    });
    socket.on('layer:update', (data) => {
      socket.broadcast.emit('layer:update', data);
    });
    socket.on('comment:update', (data) => {
      socket.broadcast.emit('comment:update', data);
    });
    // Handle user presence, typing, etc. here
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  return io;
}
