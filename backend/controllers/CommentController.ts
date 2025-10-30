// CommentController for comment entity logic
import { Request, Response } from 'express';
import { CommentService } from '../services/CommentService';

export class CommentController {
  static async getAll(req: Request, res: Response) {
    return CommentService.getAll(req, res);
  }
  static async getById(req: Request, res: Response) {
    return CommentService.getById(req, res);
  }
  static async create(req: Request, res: Response) {
    return CommentService.create(req, res);
  }
  static async update(req: Request, res: Response) {
    return CommentService.update(req, res);
  }
  static async delete(req: Request, res: Response) {
    return CommentService.delete(req, res);
  }
}
