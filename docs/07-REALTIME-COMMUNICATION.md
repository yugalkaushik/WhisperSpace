# Real-Time Communication

## Overview

WhisperSpace uses Socket.IO for bidirectional, real-time communication between clients and server. This enables instant message delivery, typing indicators, and presence tracking without polling.

## Socket.IO Architecture

### Why Socket.IO?

**Advantages over raw WebSockets**:
1. Automatic reconnection
2. Fallback to HTTP long-polling
3. Room-based message broadcasting
4. Built-in event system
5. Cross-browser compatibility
6. Binary data support
7. Acknowledgment callbacks

**Protocol Layers**:
```
Application Events (send_message, join_room, etc.)
          ↓
    Socket.IO Protocol
          ↓
    WebSocket Protocol
          ↓
      TCP/IP Stack
```

### Transport Mechanisms

**Primary Transport**: WebSocket (WSS in production)
**Fallback Transport**: HTTP Long Polling
**Upgrade Path**: Long polling → WebSocket

**Connection Handshake**:
```
1. Client initiates connection request
2. Server responds with session ID
3. Transport negotiation (prefer WebSocket)
4. Upgrade to WebSocket if supported
5. Connection established
```

## Connection Lifecycle

### Client-Side Connection

**Initialization** (`client/src/services/socket.ts`):
```typescript
import io from 'socket.io-client';

const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem('chatflow_token')
  }
});
```

**Connection States**:
- **Disconnected**: No connection to server
- **Connecting**: Attempting to establish connection
- **Connected**: Active connection established
- **Reconnecting**: Connection lost, attempting reconnection

**Lifecycle Events**:
```typescript
socket.on('connect', () => {
  // Connection established
  setConnected(true);
});

socket.on('disconnect', (reason) => {
  // Connection lost
  setConnected(false);
  if (reason === 'io server disconnect') {
    // Server disconnected client, reconnect manually
    socket.connect();
  }
  // Otherwise, automatic reconnection
});

socket.on('connect_error', (error) => {
  // Connection failed
  console.error('Connection error:', error);
});
```

### Server-Side Connection

**Authentication Middleware** (`server/src/server.ts`):
```typescript
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
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
```

**Connection Handler**:
```typescript
io.on('connection', async (socket) => {
  // Add user to online tracking
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    userId: socket.userId,
    rooms: new Set()
  });

  // Update database
  await User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastSeen: new Date()
  });

  // Register event listeners
  socket.on('join_room', handleJoinRoom);
  socket.on('leave_room', handleLeaveRoom);
  socket.on('send_message', handleSendMessage);
  socket.on('typing_start', handleTypingStart);
  socket.on('typing_stop', handleTypingStop);
  socket.on('disconnect', handleDisconnect);
});
```

## Room Management

### Socket.IO Rooms

**Concept**: Logical groupings of sockets for targeted broadcasting.

**Operations**:
- `socket.join(roomName)`: Add socket to room
- `socket.leave(roomName)`: Remove socket from room
- `io.to(roomName).emit(event, data)`: Broadcast to room
- `socket.to(roomName).emit(event, data)`: Broadcast to room except sender

### Room Code Normalization

**Purpose**: Ensure consistent room identification.

**Implementation**:
```typescript
const normalizeRoomCode = (code?: string) => 
  (code || '').trim().toUpperCase();
```

**Why**:
- Case-insensitive matching
- Trim whitespace
- Handle undefined/null values

### Join Room Flow

**Client Emits**:
```typescript
socket.emit('join_room', roomCode);
```

**Server Handler**:
```typescript
socket.on('join_room', async (room: string) => {
  const normalizedRoom = normalizeRoomCode(room);
  
  // 1. Validate room code
  if (!normalizedRoom) {
    socket.emit('error', { message: 'Room code is required' });
    return;
  }

  // 2. Join Socket.IO room
  socket.join(normalizedRoom);
  
  // 3. Update in-memory tracking
  const user = onlineUsers.get(socket.userId);
  if (user) {
    user.rooms.add(normalizedRoom);
  }

  // 4. Update database
  await Room.findOneAndUpdate(
    { code: normalizedRoom },
    {
      $addToSet: { members: socket.userId },
      $set: { isActive: true, emptyAt: null }
    },
    { new: true }
  );

  // 5. Confirm to user
  socket.emit('joined_room', normalizedRoom);
  
  // 6. Broadcast updated user list
  const roomUsers = Array.from(onlineUsers.values())
    .filter(u => u.rooms.has(normalizedRoom));
  io.to(normalizedRoom).emit('users_online', roomUsers);
});
```

**Sequence Diagram**:
```
Client              Server              Database
  │                   │                   │
  │──join_room────>│                   │
  │                   │──Normalize────>│
  │                   │──Join Room────>│
  │                   │──Update User──>│
  │                   │                   │
  │                   │──Update DB────────>│
  │                   │<─Room Doc──────────│
  │                   │                   │
  │<─joined_room────│                   │
  │<─users_online───│                   │
  │                   │                   │
```

### Leave Room Flow

**Client Emits**:
```typescript
socket.emit('leave_room', roomCode);
```

**Server Handler**:
```typescript
socket.on('leave_room', async (room: string) => {
  const normalizedRoom = normalizeRoomCode(room);
  
  // 1. Leave Socket.IO room
  socket.leave(normalizedRoom);
  
  // 2. Update in-memory tracking
  const user = onlineUsers.get(socket.userId);
  if (user) {
    user.rooms.delete(normalizedRoom);
  }
  
  // 3. Confirm to user
  socket.emit('left_room', normalizedRoom);
  
  // 4. Update database
  const updatedRoom = await Room.findOneAndUpdate(
    { code: normalizedRoom },
    { $pull: { members: socket.userId } },
    { new: true }
  );
  
  // 5. Broadcast updated user list
  const roomUsers = Array.from(onlineUsers.values())
    .filter(u => u.rooms.has(normalizedRoom));
  io.to(normalizedRoom).emit('users_online', roomUsers);
  
  // 6. Delete room if empty
  if (updatedRoom && updatedRoom.members.length === 0) {
    await Room.deleteOne({ _id: updatedRoom._id });
  }
});
```

## Message Transmission

### Send Message Flow

**Client Side** (`client/src/contexts/SocketContext.tsx`):
```typescript
const sendMessage = (content: string, room?: string) => {
  const roomToUse = normalizeRoomCode(room || currentRoom?.code);
  if (roomToUse && socket) {
    socket.emit('send_message', { 
      content, 
      room: roomToUse, 
      messageType: 'text' 
    });
  }
};
```

**Server Handler**:
```typescript
socket.on('send_message', async (data: {
  content: string;
  room: string;
  messageType?: string;
}) => {
  // 1. Rate limiting check
  if (!checkSocketRateLimit(socket.userId, 30, 60000)) {
    socket.emit('error', { 
      message: 'Too many messages. Slow down.' 
    });
    return;
  }

  const { content, room, messageType = 'text' } = data;
  const normalizedRoom = normalizeRoomCode(room);
  
  // 2. Validate content
  if (!content || typeof content !== 'string') {
    socket.emit('error', { message: 'Invalid content' });
    return;
  }

  const trimmedContent = content.trim();
  
  // 3. Check empty
  if (!trimmedContent) {
    socket.emit('error', { message: 'Message required' });
    return;
  }

  // 4. Check length
  if (trimmedContent.length > 5000) {
    socket.emit('error', { 
      message: 'Message too long (max 5000 chars)' 
    });
    return;
  }

  // 5. Validate room
  if (!normalizedRoom) {
    socket.emit('error', { message: 'Room required' });
    return;
  }

  // 6. Sanitize content (XSS prevention)
  const sanitizedContent = trimmedContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // 7. Validate message type
  const validMessageTypes = ['text', 'system'];
  const validatedMessageType = validMessageTypes.includes(messageType) 
    ? messageType 
    : 'text';

  // 8. Create message object
  const messageData = {
    _id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
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

  // 9. Broadcast to room (ephemeral, no database storage)
  io.to(normalizedRoom).emit('new_message', messageData);
});
```

**Client Receives**:
```typescript
socket.on('new_message', (message) => {
  setMessages(prev => [...prev, message]);
  // Auto-scroll to bottom
  // Play notification sound
});
```

**Message Flow Diagram**:
```
User A Types               Server Processes            User B Receives
     │                          │                           │
     │──send_message──────────>│                           │
     │  {content, room}         │──Rate Limit Check────>│
     │                          │──Validate Content────>│
     │                          │──Sanitize XSS────────>│
     │                          │──Create Message──────>│
     │                          │                           │
     │<──new_message───────────│──new_message────────────>│
     │                          │                           │
```

### Ephemeral Messages

**Key Concept**: Messages are NEVER stored in the database.

**Lifecycle**:
```
1. User sends message
2. Server validates and sanitizes
3. Server broadcasts to room members
4. Clients receive and display
5. Message exists only in client memory
6. On refresh or disconnect: LOST FOREVER
```

**Benefits**:
- Complete privacy
- No data breach risk
- Regulatory compliance
- Zero storage cost

**Trade-offs**:
- No message history
- Lost on page refresh
- Can't view past conversations

## Typing Indicators

### Start Typing

**Client Side**:
```typescript
const startTyping = (room?: string) => {
  const roomToUse = normalizeRoomCode(room || currentRoom?.code);
  if (roomToUse && socket) {
    socket.emit('typing_start', { room: roomToUse });
  }
};
```

**Server Handler**:
```typescript
socket.on('typing_start', (data: { room: string }) => {
  const normalizedRoom = normalizeRoomCode(data.room);
  if (!normalizedRoom) return;

  // Broadcast to others in room (not to sender)
  socket.to(normalizedRoom).emit('user_typing', {
    username: socket.username,
    userId: socket.userId
  });
});
```

**Client Receives**:
```typescript
socket.on('user_typing', (data) => {
  setTypingUsers(prev => [...prev, data]);
});
```

### Stop Typing

**Client Side**:
```typescript
const stopTyping = (room?: string) => {
  const roomToUse = normalizeRoomCode(room || currentRoom?.code);
  if (roomToUse && socket) {
    socket.emit('typing_stop', { room: roomToUse });
  }
};
```

**Server Handler**:
```typescript
socket.on('typing_stop', (data: { room: string }) => {
  const normalizedRoom = normalizeRoomCode(data.room);
  if (!normalizedRoom) return;

  socket.to(normalizedRoom).emit('user_stop_typing', {
    username: socket.username,
    userId: socket.userId
  });
});
```

**Client Receives**:
```typescript
socket.on('user_stop_typing', (data) => {
  setTypingUsers(prev => 
    prev.filter(u => u.userId !== data.userId)
  );
});
```

**Debouncing Strategy**:
```typescript
// Client side
let typingTimeout;

const handleInputChange = (e) => {
  const value = e.target.value;
  
  // Emit typing start
  if (!isTyping) {
    startTyping();
    setIsTyping(true);
  }
  
  // Reset timeout
  clearTimeout(typingTimeout);
  
  // Auto-stop after 1 second of inactivity
  typingTimeout = setTimeout(() => {
    stopTyping();
    setIsTyping(false);
  }, 1000);
};
```

## Presence Tracking

### Online Users Data Structure

**Server-Side Map**:
```typescript
const onlineUsers = new Map<string, {
  socketId: string;
  username: string;
  userId: string;
  rooms: Set<string>;
}>();
```

**Operations**:
- **Add**: On connection
- **Update**: On join/leave room
- **Remove**: On disconnect

### Broadcasting Online Users

**When**:
- User connects
- User joins room
- User leaves room
- User disconnects

**Implementation**:
```typescript
const roomUsers = Array.from(onlineUsers.values())
  .filter(u => u.rooms.has(normalizedRoom));

io.to(normalizedRoom).emit('users_online', roomUsers);
```

**Client Receives**:
```typescript
socket.on('users_online', (users) => {
  setOnlineUsers(users);
});
```

### Disconnect Handling

**Server Handler**:
```typescript
socket.on('disconnect', async () => {
  // Get user's rooms before removing
  const user = onlineUsers.get(socket.userId);
  const userRooms = user?.rooms || new Set();

  // Remove from online users
  onlineUsers.delete(socket.userId);

  // Update database
  await User.findByIdAndUpdate(socket.userId, {
    isOnline: false,
    lastSeen: new Date()
  });

  // Broadcast to all user's rooms
  for (const room of userRooms) {
    const roomUsers = Array.from(onlineUsers.values())
      .filter(u => u.rooms.has(room));
    io.to(room).emit('users_online', roomUsers);

    // Update room membership
    const updatedRoom = await Room.findOneAndUpdate(
      { code: room },
      { $pull: { members: socket.userId } },
      { new: true }
    );

    // Delete if empty
    if (updatedRoom && updatedRoom.members.length === 0) {
      await Room.deleteOne({ _id: updatedRoom._id });
    }
  }
});
```

## Rate Limiting

### Implementation

**Data Structure**:
```typescript
const socketRateLimits = new Map<string, {
  count: number;
  resetTime: number;
}>();
```

**Check Function**:
```typescript
const checkSocketRateLimit = (
  userId: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const userLimit = socketRateLimits.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new window
    socketRateLimits.set(userId, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  userLimit.count++;
  return true;
};
```

**Limits**:
- 30 messages per minute per user
- Independent of HTTP rate limits
- Per-user tracking (not per-socket)

## Error Handling

### Client-Side Errors

**Connection Errors**:
```typescript
socket.on('connect_error', (error) => {
  toast.error('Connection failed. Retrying...');
});
```

**Server Errors**:
```typescript
socket.on('error', (data) => {
  toast.error(data.message);
});
```

### Server-Side Errors

**Authentication Errors**:
```typescript
io.use(async (socket, next) => {
  try {
    // Verify token
  } catch (error) {
    next(new Error('Authentication error'));
  }
});
```

**Event Handler Errors**:
```typescript
socket.on('send_message', async (data) => {
  try {
    // Handle message
  } catch (error) {
    console.error('Message error:', error);
    socket.emit('error', { 
      message: 'Failed to send message' 
    });
  }
});
```

## Performance Optimization

### Client-Side

**Event Listener Cleanup**:
```typescript
useEffect(() => {
  socket.on('new_message', handleMessage);
  
  return () => {
    socket.off('new_message', handleMessage);
  };
}, []);
```

**Memoization**:
```typescript
const handleMessage = useCallback((message) => {
  setMessages(prev => [...prev, message]);
}, []);
```

### Server-Side

**Efficient Broadcasting**:
```typescript
// Only to specific room
io.to(roomCode).emit('new_message', data);

// To room except sender
socket.to(roomCode).emit('user_typing', data);
```

**Minimal Data Transfer**:
- Send only necessary fields
- Avoid sending entire user documents
- Use lean queries for database

## Monitoring and Debugging

### Connection Status

**Client-Side**:
```typescript
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

**Server-Side**:
```typescript
console.log('User connected:', socket.username);
console.log('Online users:', onlineUsers.size);
console.log('Room members:', roomUsers.length);
```

### Event Logging

**Server-Side**:
```typescript
socket.onAny((eventName, ...args) => {
  console.log('Event:', eventName, args);
});
```
