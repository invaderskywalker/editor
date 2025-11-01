// sockets/SocketServer.ts
import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { Design } from '../models/Design';
import { Types } from 'mongoose';

export function initSocketServer(httpServer: HttpServer) {
  const io = new IOServer(httpServer, {
    cors: { origin: 'http://localhost:5173', credentials: true },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    const broadcast = (event: string, data: any, room?: string) => {
      if (room) io.to(room).emit(event, data);
      else socket.broadcast.emit(event, data);
    };

    // ---------- JOIN ----------
    socket.on('design:join', async ({ designId }) => {
      const room = `design:${designId}`;
      socket.join(room);
      console.log(`${socket.id} joined ${room}`);

      try {
        const design = await Design.findById(designId);
        if (design) socket.emit('design:load', design);
      } catch (e) {
        socket.emit('error', { code: 'LOAD_FAILED', message: 'Cannot load design' });
      }
    });

    // ---------- LAYER ----------
    socket.on('layer:add', async ({ designId, layer }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return;

        design.layers.push(layer);
        await design.save();

        const added = design.layers[design.layers.length - 1];
        broadcast('layer:added', { layer: added }, room);
      } catch (e) { console.error(e); }
    });

    socket.on('layer:delete', async ({ designId, layerId }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return;

        design.layers.pull(layerId);
        await design.save();

        broadcast('layer:deleted', { layerId }, room);
      } catch (e) { console.error(e); }
    });

    socket.on('layer:update', async ({ designId, layerId, updates }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return;
        const layer = design.layers.id(layerId);
        if (!layer) return;

        Object.assign(layer, updates);
        await design.save();

        // send whole layer list (easier for UI)
        broadcast('layers:replace', { layers: design.layers }, room);
      } catch (e) { console.error(e); }
    });

    socket.on('layers:reorder', async ({ designId, layers }) => {
      const room = `design:${designId}`;
      try {
        await Design.updateOne({ _id: designId }, { $set: { layers } });
        broadcast('layers:replace', { layers }, room);
      } catch (e) { console.error(e); }
    });

    // ---------- CANVAS ----------
    socket.on('canvas:update', async ({ designId, canvas }) => {
      const room = `design:${designId}`;
      io.to(room).emit('canvas:update', { canvas }); // ← ALL clients

      await Design.findByIdAndUpdate(designId, { canvas });
    });

    // ---------- COMMENT ----------
    socket.on('comment:add', async ({ designId, comment }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return;

        design.comments.push(comment);
        await design.save();

        const added = design.comments[design.comments.length - 1];
        broadcast('comment:added', { comment: added }, room);
      } catch (e) { console.error(e); }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}