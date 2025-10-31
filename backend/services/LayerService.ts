// services/LayerService.ts
import { Request, Response } from 'express';
import { Design } from '../models/Design';

export class LayerService {
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

  static async create(req: Request, res: Response) {
    const { id: designId } = req.params;
    const layerData = req.body;
    try {
      const design = await Design.findById(designId);
      if (!design) return res.status(404).json({ code: 'NOT_FOUND', message: 'Design not found' });
      design.layers.push(layerData);
      await design.save();
      const newLayer = design.layers[design.layers.length - 1];
      res.status(201).json({ data: newLayer });
    } catch (err: any) {
      res.status(400).json({ code: 'CREATE_FAILED', message: err.message });
    }
  }

  // getById, update, delete — similar pattern
  // (I'll give full file on request)
}