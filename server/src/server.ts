// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import configurations
import connectDB from './config/database';
import passport from './config/passport';

// Import routes
import authRoutes from './routes/auth';

import roomRoutes from './routes/rooms';

// Import models
import { User } from './models/User';
import { Room, IRoom } from './models/Room';


// Import services
import { roomCleanupService } from './services/roomCleanup';
import { keepAliveService } from './services/keepAlive';
import { getClientBaseUrl, getMongoUri, getServerPort, getSessionSecret } from './utils/env';

const normalizeRoomCode = (code?: string) => (code || '').trim().toUpperCase();

const updateRoomMembership = async (roomCode: string, userId: string, action: 'add' | 'remove'): Promise<IRoom | null> => {
  const normalized = normalizeRoomCode(roomCode);
  if (!normalized || !userId) {
    return null;
  }

  try {
    if (action === 'add') {
      return await Room.findOneAndUpdate(
        { code: normalized },
        {
          $addToSet: { members: userId },
          $set: { isActive: true, emptyAt: null }
        },
        { new: true }
      );
    }

    return await Room.findOneAndUpdate(
      { code: normalized },
      { $pull: { members: userId } },
      { new: true }
    );
  } catch (error) {
    console.error(`Error updating membership for room ${normalized}:`, error);
    return null;
  }
};

const deleteRoomIfEmpty = async (roomCode: string, candidateRoom?: IRoom | null) => {
  const normalized = normalizeRoomCode(roomCode);
  if (!normalized) {
    return;
  }

  try {
    const roomDoc = candidateRoom ?? await Room.findOne({ code: normalized });
    if (roomDoc && roomDoc.members.length === 0) {
      await Room.deleteOne({ _id: roomDoc._id });
      console.log(`🗑️  Deleted room ${normalized} immediately (no members remain)`);
    }
  } catch (error) {
    console.error(`Error deleting empty room ${normalized}:`, error);
  }
};

const app = express();

// Trust proxy - Required for secure cookies behind reverse proxy (Render, Vercel, etc.)
app.set('trust proxy', 1);

const server = createServer(app);
const CLIENT_ORIGIN = getClientBaseUrl();
const SESSION_SECRET = getSessionSecret();
const MONGO_URI = getMongoUri();
const PORT = getServerPort();

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'], // Ensure WebSocket is preferred but fallback to polling
  allowEIO3: true, // Allow Engine.IO v3 clients
  pingTimeout: 60000, // Increase timeout for slower connections
  pingInterval: 25000, // Ping interval
});

// Connect to database
connectDB();

// Security Middleware - MUST COME FIRST
// Helmet for security headers (XSS protection, clickjacking, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "https:", "https://accounts.google.com", "https://*.googleusercontent.com"],
      connectSrc: ["'self'", CLIENT_ORIGIN, "https://accounts.google.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // For Socket.IO compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
}));

// Rate limiting - Prevent DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// CORS - only allow requests from client origin
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent large payload attacks
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Session middleware
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-origin on iOS
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Let browser set the domain
  },
  proxy: process.env.NODE_ENV === 'production', // Trust first proxy (required for secure cookies behind reverse proxy)
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/rooms', roomRoutes);

// Admin endpoints for room cleanup
app.get('/api/admin/cleanup/stats', async (req: any, res: any) => {
  try {
    const stats = await roomCleanupService.getCleanupStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    res.status(500).json({ error: 'Failed to get cleanup stats' });
  }
});

app.post('/api/admin/cleanup/manual', async (req: any, res: any) => {
  try {
    const result = await roomCleanupService.manualCleanup();
    res.json({
      message: 'Manual cleanup completed',
      ...result
    });
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    res.status(500).json({ error: 'Failed to perform manual cleanup' });
  }
});

// Health check endpoint
app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'OK', message: 'ChatFlow server is running' });
});

// Root endpoint to show server is running
app.get('/', (req: any, res: any) => {
  res.json({ 
    message: 'WhisperSpace Backend Server is Running! 🚀',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      CLIENT_URL: CLIENT_ORIGIN,
      PORT
    },
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      rooms: '/api/rooms/*'
    }
  });
});

// Socket.IO connection handling
interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

io.use(async (socket: any, next) => {
  try {
    console.log('🔐 Socket authentication attempt');
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('❌ No token provided in socket auth');
      return next(new Error('Authentication error'));
    }

    console.log('🔑 Token received, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('❌ User not found for token');
      return next(new Error('User not found'));
    }

    socket.userId = (user._id as any).toString();
    socket.username = user.username;
    console.log(`✅ Socket authenticated for user: ${user.username} (${socket.userId})`);
    next();
  } catch (error) {
    console.log('❌ Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Online users tracking with room support
const onlineUsers = new Map<string, { 
  socketId: string; 
  username: string; 
  userId: string; 
  rooms: Set<string>; 
}>();

// Socket event rate limiter to prevent spam
const socketRateLimits = new Map<string, { count: number; resetTime: number }>();

const checkSocketRateLimit = (userId: string, maxRequests: number = 30, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const userLimit = socketRateLimits.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit window
    socketRateLimits.set(userId, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    console.log(`⚠️ Rate limit exceeded for user ${userId}`);
    return false;
  }

  userLimit.count++;
  return true;
};

io.on('connection', async (socket: any) => {
  console.log(`🔌 User ${socket.username} (${socket.userId}) connected!`);

  // Add user to online users (without auto-joining any room)
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    userId: socket.userId,
    rooms: new Set() // Start with no rooms
  });

  // Update user status in database
  await User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastSeen: new Date()
  });

  console.log(`User ${socket.username} connected (no auto-room join)`);

  // Don't auto-join any room - let users explicitly join rooms
  // Users will join specific rooms when they create/join them

  // Handle joining rooms
  socket.on('join_room', async (room: string) => {
    const normalizedRoom = normalizeRoomCode(room);
    if (!normalizedRoom) {
      socket.emit('error', { message: 'Room code is required' });
      return;
    }

    console.log(`User ${socket.username} (${socket.userId}) joining room: ${normalizedRoom}`);
    socket.join(normalizedRoom);
    
    const user = onlineUsers.get(socket.userId);
    if (user) {
      user.rooms.add(normalizedRoom);
      console.log(`User ${socket.username} now in rooms:`, Array.from(user.rooms));
    }

    await updateRoomMembership(normalizedRoom, socket.userId, 'add');
    socket.emit('joined_room', normalizedRoom);
    
    const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(normalizedRoom));
    console.log(`Room ${normalizedRoom} now has ${roomUsers.length} users`);
    io.to(normalizedRoom).emit('users_online', roomUsers);
  });

  // Handle leaving rooms
  socket.on('leave_room', async (room: string) => {
    const normalizedRoom = normalizeRoomCode(room);
    if (!normalizedRoom) {
      return;
    }

    console.log(`User ${socket.username} leaving room: ${normalizedRoom}`);
    socket.leave(normalizedRoom);
    
    const user = onlineUsers.get(socket.userId);
    if (user) {
      user.rooms.delete(normalizedRoom);
    }
    
    socket.emit('left_room', normalizedRoom);
    
    const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(normalizedRoom));
    io.to(normalizedRoom).emit('users_online', roomUsers);
    
    const updatedRoom = await updateRoomMembership(normalizedRoom, socket.userId, 'remove');
    await deleteRoomIfEmpty(normalizedRoom, updatedRoom);
  });

  // Handle sending messages
  socket.on('send_message', async (data: {
    content: string;
    room: string;
    messageType?: string;
  }) => {
    try {
      // SECURITY: Rate limiting - max 30 messages per minute
      if (!checkSocketRateLimit(socket.userId, 30, 60000)) {
        socket.emit('error', { message: 'You are sending messages too fast. Please slow down.' });
        return;
      }

      const { content, room, messageType = 'text' } = data;
      const normalizedRoom = normalizeRoomCode(room);
      
      console.log(`📩 Message received from ${socket.username} (${socket.userId}) in room ${normalizedRoom}`);

      // SECURITY: Validate content
      if (!content || typeof content !== 'string') {
        console.log('❌ Message rejected: invalid content type');
        socket.emit('error', { message: 'Invalid message content' });
        return;
      }

      const trimmedContent = content.trim();
      
      // SECURITY: Check for empty content
      if (!trimmedContent) {
        console.log('❌ Message rejected: empty content');
        socket.emit('error', { message: 'Message content is required' });
        return;
      }

      // SECURITY: Enforce maximum message length (prevent abuse)
      const MAX_MESSAGE_LENGTH = 5000;
      if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
        console.log(`❌ Message rejected: too long (${trimmedContent.length} chars)`);
        socket.emit('error', { message: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` });
        return;
      }

      // SECURITY: Validate room
      if (!normalizedRoom) {
        console.log('❌ Message rejected: no room specified');
        socket.emit('error', { message: 'Room is required' });
        return;
      }

      // SECURITY: Sanitize message content to prevent XSS attacks
      // Note: xss-clean middleware handles this, but we add extra layer
      const sanitizedContent = trimmedContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove inline event handlers

      // SECURITY: Validate messageType
      const validMessageTypes = ['text', 'system'];
      const validatedMessageType = validMessageTypes.includes(messageType) ? messageType : 'text';

      // Create ephemeral message (don't save to database for privacy)
      const messageData = {
        _id: new Date().getTime().toString() + '-' + Math.random().toString(36).substr(2, 9), // More unique ID
        content: sanitizedContent,
        sender: {
          _id: socket.userId,
          username: socket.username,
          isOnline: true
        },
        room: normalizedRoom,
        messageType: validatedMessageType,
        createdAt: new Date(),
        isEdited: false
      };

      console.log(`📤 Broadcasting secure message to room ${normalizedRoom}`);
      
      // Emit message to all users in the room (ephemeral, real-time only)
      io.to(normalizedRoom).emit('new_message', messageData);

    } catch (error) {
      console.error('❌ Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data: { room: string }) => {
    const normalizedRoom = normalizeRoomCode(data.room);
    if (!normalizedRoom) {
      return;
    }

    socket.to(normalizedRoom).emit('user_typing', {
      username: socket.username,
      userId: socket.userId
    });
  });

  socket.on('typing_stop', (data: { room: string }) => {
    const normalizedRoom = normalizeRoomCode(data.room);
    if (!normalizedRoom) {
      return;
    }

    socket.to(normalizedRoom).emit('user_stop_typing', {
      username: socket.username,
      userId: socket.userId
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User ${socket.username} disconnected`);

    // Get user's rooms before removing
    const user = onlineUsers.get(socket.userId);
    const userRooms = user?.rooms || new Set();

    // Remove from online users
    onlineUsers.delete(socket.userId);

    // Update user status in database
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      lastSeen: new Date()
    });

    // Broadcast updated online users list to all rooms the user was in
    // and check if any rooms are now empty
    for (const room of userRooms) {
      const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(room));
      io.to(room).emit('users_online', roomUsers);

      const updatedRoom = await updateRoomMembership(room, socket.userId, 'remove');
      await deleteRoomIfEmpty(room, updatedRoom);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 ChatFlow server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  
  // Start the room cleanup service
  roomCleanupService.start();
  
  // Start the keep-alive service (only in production)
  if (process.env.NODE_ENV === 'production') {
    // Use the deployed server URL (Render, Railway, etc.)
    const serverUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || process.env.RAILWAY_STATIC_URL;
    keepAliveService.start(serverUrl);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  roomCleanupService.stop();
  keepAliveService.stop();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  roomCleanupService.stop();
  keepAliveService.stop();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});