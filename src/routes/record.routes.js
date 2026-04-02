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


router.use(authenticate);

router.get('/', getAllRecords);                              
router.get('/:id', getRecordById);                          
router.post('/', authorize('admin'), createRecord);         
router.patch('/:id', authorize('admin'), updateRecord);     
router.delete('/:id', authorize('admin'), deleteRecord);    

export default router;
