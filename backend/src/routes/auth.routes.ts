import { Router } from 'express';
import { register, login, faceLogin, profile, logout } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Auth Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/face-login', faceLogin);

// Protected Profiles & Session Endpoints
router.get('/profile', authenticateJWT as any, profile as any);
router.post('/logout', logout);

export default router;
