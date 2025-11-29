// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';

// Import configurations
import connectDB from '../src/config/database';
import passport from '../src/config/passport';

// Import routes
import authRoutes from '../src/routes/auth';
import roomRoutes from '../src/routes/rooms';
import { getClientBaseUrl, getSessionSecret } from '../src/utils/env';

const app = express();
const clientOrigin = getClientBaseUrl();
const sessionSecret = getSessionSecret();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: clientOrigin,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WhisperSpace server is running' });
});

// Export the Express API
export default app;
