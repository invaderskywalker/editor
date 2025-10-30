// DesignController for design entity logic
import { Request, Response } from 'express';
import { DesignService } from '../services/DesignService';

export class DesignController {
  static async getAll(req: Request, res: Response) {
    return DesignService.getAll(req, res);
  }
  static async getById(req: Request, res: Response) {
    return DesignService.getById(req, res);
  }
  static async create(req: Request, res: Response) {
    return DesignService.create(req, res);
  }
  static async update(req: Request, res: Response) {
    return DesignService.update(req, res);
  }
  static async delete(req: Request, res: Response) {
    return DesignService.delete(req, res);
  }
}
