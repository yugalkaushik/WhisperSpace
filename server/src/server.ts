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

// Import configurations
import connectDB from './config/database';
import passport from './config/passport';

// Import routes
import authRoutes from './routes/auth';

import roomRoutes from './routes/rooms';

// Import models
import { User } from './models/User';


// Import services
import { roomCleanupService } from './services/roomCleanup';

const app = express();
const server = createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperspace',
    touchAfter: 24 * 3600 // lazy session update
  }),
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

// Admin endpoints for room cleanup
app.get('/api/admin/cleanup/stats', async (req, res) => {
  try {
    const stats = await roomCleanupService.getCleanupStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    res.status(500).json({ error: 'Failed to get cleanup stats' });
  }
});

app.post('/api/admin/cleanup/manual', async (req, res) => {
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChatFlow server is running' });
});

// Root endpoint to show server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'WhisperSpace Backend Server is Running! 🚀',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      CLIENT_URL: process.env.CLIENT_URL,
      PORT: process.env.PORT
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
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = (user._id as any).toString();
    socket.username = user.username;
    next();
  } catch (error) {
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

io.on('connection', async (socket: any) => {
  // User connected

  // Add user to online users
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    userId: socket.userId,
    rooms: new Set(['general'])
  });

  // Update user status in database
  await User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastSeen: new Date()
  });

  // Join general room by default
  socket.join('general');

  // Broadcast updated online users list to general room
  const generalUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has('general'));
  io.to('general').emit('users_online', generalUsers);

  // Handle joining rooms
  socket.on('join_room', (room: string) => {
    socket.join(room);
    
    // Update user's room list
    const user = onlineUsers.get(socket.userId);
    if (user) {
      user.rooms.add(room);
    }
    
    socket.emit('joined_room', room);
    
    // Emit room-specific online users
    const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(room));
    io.to(room).emit('users_online', roomUsers);
  });

  // Handle leaving rooms
  socket.on('leave_room', (room: string) => {
    socket.leave(room);
    
    // Update user's room list
    const user = onlineUsers.get(socket.userId);
    if (user) {
      user.rooms.delete(room);
    }
    
    socket.emit('left_room', room);
    
    // Emit updated online users for the room
    const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(room));
    io.to(room).emit('users_online', roomUsers);
  });

  // Handle sending messages
  socket.on('send_message', async (data: {
    content: string;
    room: string;
    messageType?: string;
  }) => {
    try {
      const { content, room, messageType = 'text' } = data;

      if (!content || !content.trim()) {
        socket.emit('error', { message: 'Message content is required' });
        return;
      }

      // Create ephemeral message (don't save to database)
      const messageData = {
        _id: new Date().getTime().toString(), // Simple ID for client
        content: content.trim(),
        sender: {
          _id: socket.userId,
          username: socket.username,
          isOnline: true
        },
        room,
        messageType,
        createdAt: new Date(),
        isEdited: false
      };

      // Emit message to all users in the room (ephemeral, real-time only)
      io.to(room).emit('new_message', messageData);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data: { room: string }) => {
    socket.to(data.room).emit('user_typing', {
      username: socket.username,
      userId: socket.userId
    });
  });

  socket.on('typing_stop', (data: { room: string }) => {
    socket.to(data.room).emit('user_stop_typing', {
      username: socket.username,
      userId: socket.userId
    });
  });

  // Handle message editing (REMOVED - messages are now ephemeral)
  
  // Handle message deletion (REMOVED - messages are now ephemeral)

  // Handle disconnect
  socket.on('disconnect', async () => {
    // User disconnected

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
    userRooms.forEach(room => {
      const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(room));
      io.to(room).emit('users_online', roomUsers);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 ChatFlow server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  
  // Start the room cleanup service
  roomCleanupService.start();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  roomCleanupService.stop();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  roomCleanupService.stop();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});