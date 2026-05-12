import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;
