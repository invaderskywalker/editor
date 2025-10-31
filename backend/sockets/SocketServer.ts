// sockets/SocketServer.ts
import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { Design } from '../models/Design';

export function initSocketServer(httpServer: HttpServer) {
  const io = new IOServer(httpServer, {
    cors: { origin: 'http://localhost:5173', credentials: true }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // ---------- LAYER ADD ----------
    socket.on('layer:add', async ({ designId, layer }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return;

        design.layers.push(layer);
        await design.save();

        const addedLayer = design.layers[design.layers.length - 1];
        io.to(room).emit('layer:added', { layer: addedLayer });
      } catch (e) {
        console.error(e);
      }
    });

    // ---------- JOIN DESIGN ----------
    socket.on('design:join', async ({ designId }) => {
      const room = `design:${designId}`;
      socket.join(room);
      console.log(`${socket.id} joined ${room}`);

      try {
        const design = await Design.findById(designId).lean();
        if (design) socket.emit('design:load', design);
      } catch (e) {
        socket.emit('error', { code: 'LOAD_FAILED', message: 'Cannot load design' });
      }
    });

    // ---------- CANVAS UPDATE ----------
    socket.on('design:update', async ({ designId, canvas }) => {
      const room = `design:${designId}`;
      socket.to(room).emit('design:update', { canvas, from: socket.id });

      try {
        await Design.findByIdAndUpdate(designId, { canvas }, { new: true });
      } catch (e) {
        console.error('Autosave failed', e);
        socket.emit('error', { code: 'AUTOSAVE_FAILED', message: 'Could not save' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}