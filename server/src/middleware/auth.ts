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
    // First verify the token without database lookup to catch expired/invalid tokens
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    if (!decoded || !decoded.userId) {
      res.status(401).json({ message: 'Invalid token format' });
      return;
    }
    
    // Now check if the user exists
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      // Token is valid but user doesn't exist in the database
      res.status(401).json({ message: 'User account not found. Please login again.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Authentication expired. Please login again.' });
    } else {
      res.status(403).json({ message: 'Invalid authentication token' });
    }
  }
};