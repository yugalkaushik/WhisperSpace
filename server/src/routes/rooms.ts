import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  createRoom,
  joinRoom,
  getRoomInfo,
  leaveRoom
} from '../controllers/roomController';

const router = express.Router();

console.log('🔧 ROOMS ROUTES: Using authenticateToken middleware (not simpleAuth) - Updated at', new Date().toISOString());

// Room management routes with proper authentication
router.post('/create', authenticateToken as any, createRoom as any);
router.post('/join', authenticateToken as any, joinRoom as any);
router.get('/:roomCode', authenticateToken as any, getRoomInfo as any);
router.delete('/:roomCode/leave', authenticateToken as any, leaveRoom as any);

export default router;
