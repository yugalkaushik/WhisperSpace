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
router.use(authenticateToken);

// Message CRUD operations
router.get('/', getMessages);
router.post('/', sendMessage);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);

export default router;