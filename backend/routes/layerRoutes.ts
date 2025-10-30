// layerRoutes for Layer entity endpoints
import { Router } from 'express';
import { LayerController } from '../controllers/LayerController';

const router = Router();
router.get('/', LayerController.getAll);
router.get('/:id', LayerController.getById);
router.post('/', LayerController.create);
router.put('/:id', LayerController.update);
router.delete('/:id', LayerController.delete);
export default router;
