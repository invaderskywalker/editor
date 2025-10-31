// services/LayerService.ts
import { Request, Response } from 'express';
import { Design } from '../models/Design';
import { Types } from 'mongoose';

export class LayerService {
  // GET /api/designs/:id/layers
  static async getAll(req: Request, res: Response) {
    const { id: designId } = req.params;
    try {
      const design = await Design.findById(designId).select('layers');
      if (!design) return res.status(404).json({ code: 'NOT_FOUND', message: 'Design not found' });
      res.json({ data: design.layers });
    } catch (err: any) {
      res.status(500).json({ code: 'DB_ERROR', message: err.message });
    }
  }

  // POST /api/designs/:id/layers
  static async create(req: Request, res: Response) {
    const { id: designId } = req.params;
    const { name, visible = true, locked = false } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Layer name is required and must be a string' });
    }

    try {
      const design = await Design.findById(designId);
      if (!design) return res.status(404).json({ code: 'NOT_FOUND', message: 'Design not found' });

      const newLayer = { name, visible, locked };
      design.layers.push(newLayer);
      await design.save();

      const addedLayer = design.layers[design.layers.length - 1];
      res.status(201).json({ data: addedLayer });
    } catch (err: any) {
      res.status(400).json({ code: 'CREATE_FAILED', message: err.message });
    }
  }

  // GET /api/designs/:id/layers/:layerId
  static async getById(req: Request, res: Response) {
    const { id: designId, layerId } = req.params;
    try {
      const design = await Design.findById(designId);
      if (!design) return res.status(404).json({ code: 'NOT_FOUND', message: 'Design not found' });

      const layer = design.layers.id(layerId);
      if (!layer) return res.status(404).json({ code: 'NOT_FOUND', message: 'Layer not found' });

      res.json({ data: layer });
    } catch (err: any) {
      res.status(500).json({ code: 'DB_ERROR', message: err.message });
    }
  }

  // PUT /api/designs/:id/layers/:layerId
  static async update(req: Request, res: Response) {
    const { id: designId, layerId } = req.params;
    const updates = req.body;

    try {
      const design = await Design.findById(designId);
      if (!design) return res.status(404).json({ code: 'NOT_FOUND', message: 'Design not found' });

      const layer = design.layers.id(layerId);
      if (!layer) return res.status(404).json({ code: 'NOT_FOUND', message: 'Layer not found' });

      Object.assign(layer, updates);
      await design.save();

      res.json({ data: layer });
    } catch (err: any) {
      res.status(400).json({ code: 'UPDATE_FAILED', message: err.message });
    }
  }

  // DELETE /api/designs/:id/layers/:layerId
  static async delete(req: Request, res: Response) {
    const { id: designId, layerId } = req.params;
    try {
      const design = await Design.findById(designId);
      if (!design) return res.status(404).json({ code: 'NOT_FOUND', message: 'Design not found' });

      const layer = design.layers.id(layerId);
      if (!layer) return res.status(404).json({ code: 'NOT_FOUND', message: 'Layer not found' });

      design.layers.pull(layerId);
      await design.save();

      res.json({ message: 'Layer deleted' });
    } catch (err: any) {
      res.status(500).json({ code: 'DELETE_FAILED', message: err.message });
    }
  }
}