// commentRoutes for Comment entity endpoints
import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';

const router = Router();
router.get('/', CommentController.getAll);
router.get('/:id', CommentController.getById);
router.post('/', CommentController.create);
router.put('/:id', CommentController.update);
router.delete('/:id', CommentController.delete);
export default router;
