import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController.mjs';
import protect from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

export default router;