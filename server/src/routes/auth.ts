import express from 'express';
import passport from 'passport';
import { authenticateToken } from '../middleware/auth';
import {
  register,
  login,
  logout,
  getProfile,
  googleCallback
} from '../controllers/authController';

const router = express.Router();

// Regular authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

export default router;