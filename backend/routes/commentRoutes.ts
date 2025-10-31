// routes/commentRoutes.ts
import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';

const router = Router({ mergeParams: true });

router.get('/', CommentController.getAll);
router.post('/', CommentController.create);
router.get('/:commentId', CommentController.getById);
router.put('/:commentId', CommentController.update);
router.delete('/:commentId', CommentController.delete);

export default router;