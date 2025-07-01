import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    let user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      // For Google OAuth users, create a basic user entry if it doesn't exist
      user = new User({
        _id: decoded.userId,
        username: 'Google User',
        email: 'temp@example.com',
        googleId: 'google_' + decoded.userId,
        nickname: 'Google User',
        selectedAvatar: 'avatar1'
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed');
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};