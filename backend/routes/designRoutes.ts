// routes/designRoutes.ts
import { Router } from 'express';
import { DesignController } from '../controllers/DesignController';
import layerRoutes from './layerRoutes';
import commentRoutes from './commentRoutes';

const router = Router();

// Top-level design CRUD
router.get('/', DesignController.getAll);
router.post('/', DesignController.create);
router.get('/:id', DesignController.getById);
router.put('/:id', DesignController.update);
router.delete('/:id', DesignController.delete);

// Nested: layers and comments
router.use('/:id/layers', layerRoutes);
router.use('/:id/comments', commentRoutes);

export default router;