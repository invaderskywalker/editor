// designRoutes for Design entity endpoints
import { Router } from 'express';
import { DesignController } from '../controllers/DesignController';

const router = Router();
router.get('/', DesignController.getAll);
router.get('/:id', DesignController.getById);
router.post('/', DesignController.create);
router.put('/:id', DesignController.update);
router.delete('/:id', DesignController.delete);
export default router;
