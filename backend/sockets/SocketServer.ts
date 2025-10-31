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

    socket.on('layer:add', async ({ designId, layer }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return;
        design.layers.push(layer);
        await design.save();
        io.to(room).emit('layer:added', { layer });
      } catch (e) {}
    });

    // ----- join a design room -----
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

    // ----- receive canvas update from a client -----
    socket.on('design:update', async ({ designId, canvas }) => {
      const room = `design:${designId}`;
      // broadcast to everyone **except** sender
      socket.to(room).emit('design:update', { canvas, from: socket.id });

      // ---- persist (autosave) ----
      try {
        await Design.findByIdAndUpdate(designId, { canvas }, { new: true });
      } catch (e) {
        console.error('Autosave failed', e);
        socket.emit('error', { code: 'AUTOSAVE_FAILED', message: 'Could not save' });
      }
    });

    // ----- add a comment (real-time + DB) -----
    socket.on('comment:add', async ({ designId, comment }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return socket.emit('error', { code: 'NOT_FOUND', message: 'Design missing' });

        design.comments.push(comment);
        await design.save();

        io.to(room).emit('comment:added', { comment });
      } catch (e) {
        socket.emit('error', { code: 'COMMENT_SAVE_FAILED', message: 'Could not add comment' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}