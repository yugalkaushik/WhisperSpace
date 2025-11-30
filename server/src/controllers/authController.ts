import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { OTP } from '../models/OTP';
import { AuthRequest } from '../middleware/auth';
import { getClientBaseUrl } from '../utils/env';
import { generateOTP, sendOTPEmail } from '../services/emailService';
import bcrypt from 'bcryptjs';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

const redirectToClient = (res: Response, path: string) => {
  try {
    const baseUrl = getClientBaseUrl();
    res.redirect(`${baseUrl}${path}`);
  } catch (error) {
    console.error('CLIENT_URL missing; unable to redirect user', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server misconfiguration: CLIENT_URL not set' });
    }
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken((user._id as any).toString());

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update user status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken((user._id as any).toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      req.user.isOnline = false;
      req.user.lastSeen = new Date();
      await req.user.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    res.json({
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        isOnline: req.user.isOnline,
        lastSeen: req.user.lastSeen
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    console.log('Google callback triggered');
    console.log('req.user:', req.user);
    console.log('CLIENT_URL:', getClientBaseUrl());
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const user = req.user as any;
    
    if (!user) {
      console.log('No user found in callback');
      console.log('Redirecting to (no user)');
      redirectToClient(res, '/login?error=auth_failed');
      return;
    }

    console.log('User found:', user.email);

    // Update user status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());
    
    // Use localhost for development, production URL for production
    console.log('Redirecting to (success)');
    
    // Redirect back to frontend callback handler with token
    redirectToClient(res, `/auth/callback?token=${token}`);
    return;
  } catch (error) {
    console.error('Google callback error:', error);
    console.log('Redirecting to (error)');
    redirectToClient(res, '/login?error=server_error');
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Profile updates (nickname, avatar) are now handled on frontend with localStorage
    // This endpoint just returns the current user data
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send OTP for email verification
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ message: 'Email and purpose are required' });
    }

    if (!['registration', 'login'].includes(purpose)) {
      return res.status(400).json({ message: 'Invalid purpose' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (purpose === 'registration' && existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (purpose === 'login' && !existingUser) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ email, purpose });

    // Generate and save new OTP
    const otpCode = generateOTP();
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    
    const otp = new OTP({
      email,
      otp: hashedOTP,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otp.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otpCode, purpose);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent successfully',
      expiresIn: 600 // seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

// Verify OTP and complete registration/login
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp, purpose, username, password } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({ message: 'Email, OTP, and purpose are required' });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      email, 
      purpose,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteMany({ email, purpose });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP' });
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValidOTP) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        message: 'Invalid OTP',
        attemptsLeft: 5 - otpRecord.attempts
      });
    }

    // OTP is valid - delete all OTPs for this email
    await OTP.deleteMany({ email, purpose });

    if (purpose === 'registration') {
      // Validate registration data
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required for registration' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Create new user with verified email
      const user = new User({
        username,
        email,
        password,
        isEmailVerified: true
      });

      await user.save();

      // Generate token
      const token = generateToken((user._id as any).toString());

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          isOnline: user.isOnline
        }
      });
    } else {
      // Login
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Mark email as verified if not already
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
      }

      // Update user status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      // Generate token
      const token = generateToken((user._id as any).toString());

      res.json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          isOnline: user.isOnline
        }
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};