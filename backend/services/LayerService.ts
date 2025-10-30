// LayerService handles layer data access
import { Request, Response } from 'express';

export class LayerService {
  static async getAll(req: Request, res: Response) {
    res.status(200).json({ message: 'List all layers (stub)' });
  }
  static async getById(req: Request, res: Response) {
    res.status(200).json({ message: `Get layer by id ${req.params.id} (stub)` });
  }
  static async create(req: Request, res: Response) {
    res.status(201).json({ message: 'Create layer (stub)' });
  }
  static async update(req: Request, res: Response) {
    res.status(200).json({ message: `Update layer by id ${req.params.id} (stub)` });
  }
  static async delete(req: Request, res: Response) {
    res.status(200).json({ message: `Delete layer by id ${req.params.id} (stub)` });
  }
}
