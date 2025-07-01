import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import configurations
import connectDB from './config/database';
import passport from './config/passport';

// Import routes
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';

// Import models
import { User } from './models/User';
import { Message } from './models/Message';

// Load environment variables
dotenv.config();

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChatFlow server is running' });
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

    socket.userId = user._id.toString();
    socket.username = user.username;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Online users tracking
const onlineUsers = new Map<string, { socketId: string; username: string; userId: string }>();

io.on('connection', async (socket: any) => {
  console.log(`User connected: ${socket.username} (${socket.id})`);

  // Add user to online users
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    userId: socket.userId
  });

  // Update user status in database
  await User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastSeen: new Date()
  });

  // Join general room by default
  socket.join('general');

  // Broadcast updated online users list
  io.emit('users_online', Array.from(onlineUsers.values()));

  // Handle joining rooms
  socket.on('join_room', (room: string) => {
    socket.join(room);
    socket.emit('joined_room', room);
  });

  // Handle leaving rooms
  socket.on('leave_room', (room: string) => {
    socket.leave(room);
    socket.emit('left_room', room);
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

      // Create and save message
      const message = new Message({
        content: content.trim(),
        sender: socket.userId,
        room,
        messageType
      });

      await message.save();
      await message.populate('sender', 'username avatar isOnline');

      // Emit message to all users in the room
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

      if (message.sender.toString() !== socket.userId) {
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

      if (message.sender.toString() !== socket.userId) {
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

    // Remove from online users
    onlineUsers.delete(socket.userId);

    // Update user status in database
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      lastSeen: new Date()
    });

    // Broadcast updated online users list
    io.emit('users_online', Array.from(onlineUsers.values()));
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 ChatFlow server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
});