// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import jwt from 'jsonwebtoken';

// Import configurations
import connectDB from './config/database';
import passport from './config/passport';

// Import routes
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import roomRoutes from './routes/rooms';

// Import models
import { User } from './models/User';
import { Message } from './models/Message';

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
app.use('/api/messages', messageRoutes);
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

// Socket.IO connection handling
interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  nickname?: string;
  selectedAvatar?: string;
}

io.use(async (socket: any, next) => {
  try {
    const token = socket.handshake.auth.token;
    const nickname = socket.handshake.auth.nickname;
    const selectedAvatar = socket.handshake.auth.selectedAvatar;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    // Try to verify the token and get user from database
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (user) {
        socket.userId = (user._id as any).toString();
        socket.username = user.username;
        // Use localStorage profile data if available, otherwise fallback to database
        socket.nickname = nickname || user.nickname || user.username;
        socket.selectedAvatar = selectedAvatar || user.selectedAvatar || 'avatar1';
        socket.userAvatar = user.avatar || '';
      } else {
        // If user not found in DB, create identity from token and localStorage
        socket.userId = decoded.userId;
        socket.username = `User_${decoded.userId.slice(-6)}`;
        socket.nickname = nickname || socket.username;
        socket.selectedAvatar = selectedAvatar || 'avatar1';
        socket.userAvatar = '';
      }
    } catch (jwtError) {
      // If token verification fails, still allow connection with localStorage data
      console.log('JWT verification failed, using localStorage data:', jwtError);
      const tempId = Date.now().toString();
      socket.userId = tempId;
      socket.username = `Guest_${tempId.slice(-6)}`;
      socket.nickname = nickname || socket.username;
      socket.selectedAvatar = selectedAvatar || 'avatar1';
      socket.userAvatar = '';
    }

    console.log(`Socket auth successful: ${socket.nickname} (${socket.userId})`);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Online users tracking with room support
const onlineUsers = new Map<string, { 
  socketId: string; 
  username: string; 
  userId: string; 
  nickname?: string;
  selectedAvatar?: string;
  rooms: Set<string>; 
}>();

io.on('connection', async (socket: any) => {
  console.log(`User connected: ${socket.username} (${socket.id})`);

  // Add user to online users
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    userId: socket.userId,
    nickname: socket.nickname,
    selectedAvatar: socket.selectedAvatar,
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

      // Create message object (without saving to database)
      const message = {
        _id: Date.now().toString(), // Simple ID for real-time purposes
        content: content.trim(),
        sender: {
          _id: socket.userId,
          username: socket.username,
          avatar: socket.userAvatar || '',
          isOnline: true
        },
        room,
        messageType,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Emit message to all users in the room (no database save)
      io.to(room).emit('new_message', message);

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

  // Handle message editing
  socket.on('edit_message', async (data: {
    messageId: string;
    content: string;
    room: string;
  }) => {
    try {
      const { messageId, content, room } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      if ((message.sender as any).toString() !== socket.userId) {
        socket.emit('error', { message: 'You can only edit your own messages' });
        return;
      }

      // Check if message is not too old (15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      if (message.createdAt < fifteenMinutesAgo) {
        socket.emit('error', { message: 'Message is too old to edit' });
        return;
      }

      message.content = content.trim();
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      await message.populate('sender', 'username avatar isOnline');

      // Emit updated message to room
      io.to(room).emit('message_edited', message);

    } catch (error) {
      console.error('Edit message error:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // Handle message deletion
  socket.on('delete_message', async (data: {
    messageId: string;
    room: string;
  }) => {
    try {
      const { messageId, room } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      if ((message.sender as any).toString() !== socket.userId) {
        socket.emit('error', { message: 'You can only delete your own messages' });
        return;
      }

      await Message.findByIdAndDelete(messageId);

      // Emit deletion to room
      io.to(room).emit('message_deleted', { messageId });

    } catch (error) {
      console.error('Delete message error:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.username} (${socket.id})`);

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

const PORT = process.env.PORT || 5000;

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