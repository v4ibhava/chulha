import { Router } from 'express';
import { register, login, getMe, updateProfile, addAddress, editAddress, deleteAddress } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.put('/address/:id', protect, editAddress);
router.delete('/address/:id', protect, deleteAddress);

export default router;
