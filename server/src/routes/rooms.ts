import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createRoom,
  joinRoom,
  getRoomInfo,
  leaveRoom
} from '../controllers/roomController';

const router = express.Router();

// All room routes require authentication
router.use(authenticateToken as any);

// Room management routes
router.post('/create', createRoom as any);
router.post('/join', joinRoom as any);
router.get('/:roomCode', getRoomInfo as any);
router.delete('/:roomCode/leave', leaveRoom as any);

export default router;
