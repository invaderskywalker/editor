// LayerController for layer entity logic
import { Request, Response } from 'express';
import { LayerService } from '../services/LayerService';

export class LayerController {
  static async getAll(req: Request, res: Response) {
    return LayerService.getAll(req, res);
  }
  static async getById(req: Request, res: Response) {
    return LayerService.getById(req, res);
  }
  static async create(req: Request, res: Response) {
    return LayerService.create(req, res);
  }
  static async update(req: Request, res: Response) {
    return LayerService.update(req, res);
  }
  static async delete(req: Request, res: Response) {
    return LayerService.delete(req, res);
  }
}
