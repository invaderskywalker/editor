// routes/layerRoutes.ts
import { Router } from 'express';
import { LayerController } from '../controllers/LayerController';

const router = Router({ mergeParams: true }); // important!

router.get('/', LayerController.getAll);
router.post('/', LayerController.create);
router.get('/:layerId', LayerController.getById);
router.put('/:layerId', LayerController.update);
router.delete('/:layerId', LayerController.delete);

export default router;