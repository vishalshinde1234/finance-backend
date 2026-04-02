import { Router } from 'express';
import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from '../controllers/record.controller.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = Router();

// Sab routes pe authenticate zaroori
router.use(authenticate);

router.get('/', getAllRecords);                              // viewer, analyst, admin
router.get('/:id', getRecordById);                          // viewer, analyst, admin
router.post('/', authorize('admin'), createRecord);         // sirf admin
router.patch('/:id', authorize('admin'), updateRecord);     // sirf admin
router.delete('/:id', authorize('admin'), deleteRecord);    // sirf admin

export default router;