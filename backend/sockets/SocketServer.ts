import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { Design } from '../models/Design';
import { Types } from 'mongoose';

type HashMap = Map<string, string>;
type TimerMap = Map<string, NodeJS.Timeout>;

// djb2 hash -> base36 string
function hashString(s: string) {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash) + s.charCodeAt(i);
    hash = hash & hash;
  }
  return (hash >>> 0).toString(36);
}

export function initSocketServer(httpServer: HttpServer) {
  const io = new IOServer(httpServer, {
    cors: { origin: 'http://localhost:5173', credentials: true },
  });

  // In-memory last-known canvas hash per design (room). If you run multiple server
  // instances, move this to shared storage (Redis).
  const lastCanvasHashByDesign: HashMap = new Map();
  const saveTimers: TimerMap = new Map();
  const SAVE_DEBOUNCE_MS = 800; // debounce DB writes per-design

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
        const design = await Design.findById(designId).lean();
        if (design) {
          // initialize lastCanvasHash for this design so server can ignore duplicates
          try {
            const serialized = JSON.stringify(design.canvas || {});
            const h = hashString(serialized);
            lastCanvasHashByDesign.set(designId, h);
          } catch (e) { /* ignore */ }

          socket.emit('design:load', design);
        }
      } catch (e) {
        socket.emit('error', { code: 'LOAD_FAILED', message: 'Cannot load design' });
      }
    });

    // ---------- LAYER EVENTS (unchanged but broadcasting via helper) ----------
    socket.on('layer:add', async ({ designId, layer }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return;

        design.layers.push(layer);
        await design.save();

        const added = design.layers[design.layers.length - 1];
        broadcast('layer:added', { layer: added }, room);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('layer:delete', async ({ designId, layerId }) => {
      const room = `design:${designId}`;
      try {
        const design = await Design.findById(designId);
        if (!design) return;

        design.layers.pull(layerId);
        await design.save();

        broadcast('layer:deleted', { layerId }, room);
      } catch (e) {
        console.error(e);
      }
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
        broadcast('layers:replace', { layers: design.layers }, room);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('layers:reorder', async ({ designId, layers }) => {
      const room = `design:${designId}`;
      try {
        await Design.updateOne({ _id: designId }, { $set: { layers } });
        broadcast('layers:replace', { layers }, room);
      } catch (e) {
        console.error(e);
      }
    });

    // ---------- SINGLE OBJECT ADD ----------
    socket.on('canvas:object:add', async ({ designId, object }) => {
      const room = `design:${designId}`;
      // broadcast this object to others
      socket.to(room).emit('canvas:object:add', { object });

      // optional: update DB on next debounce cycle
      const existingTimer = saveTimers.get(designId);
      if (existingTimer) clearTimeout(existingTimer);
      const t = setTimeout(async () => {
        try {
          const design = await Design.findById(designId);
          if (!design) return;
          const json = design.canvas || {};
          json.objects = [...(json.objects || []), object];
          await Design.findByIdAndUpdate(designId, { canvas: json });
        } catch (e) {
          console.error('Failed to save object add:', e);
        } finally {
          saveTimers.delete(designId);
        }
      }, SAVE_DEBOUNCE_MS);
      saveTimers.set(designId, t);
    });


    // ---------- CANVAS (with hash dedup + debounced save) ----------
    socket.on('canvas:update', async ({ designId, canvas }) => {
      const room = `design:${designId}`;

      try {
        const serialized = JSON.stringify(canvas || {});
        const h = hashString(serialized);

        const last = lastCanvasHashByDesign.get(designId);
        if (last && last === h) {
          // identical — ignore to prevent thrash
          return;
        }

        // update in-memory hash
        lastCanvasHashByDesign.set(designId, h);

        // broadcast to others in room (exclude sender)
        // io.to(room).emit('canvas:update', { canvas });
        socket.to(room).emit('canvas:update', { canvas });


        // debounce DB save per design
        const existingTimer = saveTimers.get(designId);
        if (existingTimer) clearTimeout(existingTimer);

        const t = setTimeout(async () => {
          try {
            await Design.findByIdAndUpdate(designId, { canvas });
          } catch (e) {
            console.error('Failed to save canvas to DB:', e);
          } finally {
            saveTimers.delete(designId);
          }
        }, SAVE_DEBOUNCE_MS);

        saveTimers.set(designId, t);
      } catch (e) {
        console.error('Error handling canvas:update', e);
      }
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
      } catch (e) {
        console.error(e);
      }
    });

    // ---------- DISCONNECT ----------
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
