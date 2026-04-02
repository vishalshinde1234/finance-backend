import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUserStatus,
} from '../controllers/user.controller.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);

export default router;