import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import jwt from 'jsonwebtoken';

import connectDB from './config/database';
import passport from './config/passport';

import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';

import { User } from './models/User';

import { roomCleanupService } from './services/roomCleanup';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperspace',
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WhisperSpace server is running' });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'WhisperSpace Backend Server is Running! 🚀',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      rooms: '/api/rooms/*'
    }
  });
});

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

const onlineUsers = new Map<string, { 
  socketId: string; 
  username: string; 
  userId: string; 
  rooms: Set<string>; 
}>();

io.on('connection', async (socket: any) => {
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    userId: socket.userId,
    rooms: new Set(['general'])
  });

  await User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastSeen: new Date()
  });

  socket.join('general');

  const generalUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has('general'));
  io.to('general').emit('users_online', generalUsers);

  socket.on('join_room', (room: string) => {
    socket.join(room);
    
    const user = onlineUsers.get(socket.userId);
    if (user) {
      user.rooms.add(room);
    }
    
    socket.emit('joined_room', room);
    
    const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(room));
    io.to(room).emit('users_online', roomUsers);
  });

  socket.on('leave_room', (room: string) => {
    socket.leave(room);
    
    const user = onlineUsers.get(socket.userId);
    if (user) {
      user.rooms.delete(room);
    }
    
    socket.emit('left_room', room);
    
    const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(room));
    io.to(room).emit('users_online', roomUsers);
  });

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

      const messageData = {
        _id: new Date().getTime().toString(),
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

      io.to(room).emit('new_message', messageData);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

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

  socket.on('disconnect', async () => {
    const user = onlineUsers.get(socket.userId);
    const userRooms = user?.rooms || new Set();

    onlineUsers.delete(socket.userId);

    await User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      lastSeen: new Date()
    });

    userRooms.forEach(room => {
      const roomUsers = Array.from(onlineUsers.values()).filter(u => u.rooms.has(room));
      io.to(room).emit('users_online', roomUsers);
    });
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 ChatFlow server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  
  roomCleanupService.start();
});

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