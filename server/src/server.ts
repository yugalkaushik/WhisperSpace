// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

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
app.use(cookieParser());
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

// Test endpoint to manually mark a room as empty (for testing)
app.post('/api/admin/rooms/:roomCode/mark-empty', async (req: any, res: any) => {
  try {
    const { roomCode } = req.params;
    const result = await Room.findOneAndUpdate(
      { code: roomCode.toUpperCase() },
      { 
        emptyAt: new Date(),
        isActive: false 
      },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ 
      message: `Room ${roomCode} marked as empty`,
      room: result 
    });
  } catch (error) {
    console.error('Error marking room as empty:', error);
    res.status(500).json({ error: 'Failed to mark room as empty' });
  }
});

// Admin endpoint to delete all rooms (for testing)
app.delete('/api/admin/rooms/all', async (req: any, res: any) => {
  try {
    const result = await Room.deleteMany({});
    res.json({ 
      message: `Deleted all rooms`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all rooms:', error);
    res.status(500).json({ error: 'Failed to delete all rooms' });
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
      const { content, room, messageType = 'text' } = data;
      const normalizedRoom = normalizeRoomCode(room);
      
      console.log(`📩 Message received from ${socket.username} (${socket.userId}) in room ${normalizedRoom}`);

      if (!content || !content.trim()) {
        console.log('❌ Message rejected: empty content');
        socket.emit('error', { message: 'Message content is required' });
        return;
      }

      if (!normalizedRoom) {
        console.log('❌ Message rejected: no room specified');
        socket.emit('error', { message: 'Room is required' });
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
        room: normalizedRoom,
        messageType,
        createdAt: new Date(),
        isEdited: false
      };

      console.log(`📤 Broadcasting realtime message to room ${normalizedRoom}`);
      
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

  // Handle message editing (REMOVED - messages are now ephemeral)
  
  // Handle message deletion (REMOVED - messages are now ephemeral)

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