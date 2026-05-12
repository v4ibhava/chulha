import { Router } from 'express';
import { getFoods, getFood, createFood, updateFood, deleteFood } from '../controllers/foodController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.get('/', getFoods);
router.get('/:id', getFood);
router.post('/', protect, authorize('admin'), upload.single('image'), createFood);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateFood);
router.delete('/:id', protect, authorize('admin'), deleteFood);

export default router;
