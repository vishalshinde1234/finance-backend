import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe); // login check — token valid hai?

export default router;