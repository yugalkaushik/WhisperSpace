import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage
} from '../controllers/messageController';

const router = express.Router();

// All message routes require authentication
router.use(authenticateToken as any);

// Message CRUD operations
router.get('/', getMessages as any);
router.post('/', sendMessage as any);
router.put('/:messageId', editMessage as any);
router.delete('/:messageId', deleteMessage as any);

export default router;