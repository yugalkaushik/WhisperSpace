import express from 'express';
import passport from 'passport';
import { authenticateToken } from '../middleware/auth';
import {
  register,
  login,
  logout,
  getProfile,
  googleCallback,
  updateProfile
} from '../controllers/authController';
import { getClientBaseUrl } from '../utils/env';

const router = express.Router();
const clientBaseUrl = getClientBaseUrl();

// Test endpoint to verify auth routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working', timestamp: new Date().toISOString() });
});

// Registration and login routes
router.post('/register', register as any);
router.post('/login', login as any);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${clientBaseUrl}/login?error=auth_failed`,
    failureMessage: true 
  }),
  googleCallback
);

// Profile route (for verifying tokens)
router.get('/profile', authenticateToken as any, getProfile as any);

// Update profile route
router.put('/profile', authenticateToken as any, updateProfile as any);

// Logout route
router.post('/logout', authenticateToken as any, logout as any);



export default router;