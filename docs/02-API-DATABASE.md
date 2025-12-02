# API & Database Reference

## API Endpoints

### Base URL
- Development: `http://localhost:5000/api`
- Production: Your deployed backend URL

### Authentication
Most endpoints require JWT authentication via Bearer token in the header:
```
Authorization: Bearer <jwt-token>
```

### Auth Endpoints

#### Send OTP
```
POST /api/auth/send-otp
Body: { "email": "user@example.com" }
Response: { "message": "OTP sent successfully" }
```

#### Verify OTP & Login
```
POST /api/auth/verify-otp
Body: { "email": "user@example.com", "otp": "123456" }
Response: { 
  "token": "jwt-token",
  "user": { "_id", "email", "username", "avatar", "isEmailVerified" }
}
```

#### Google OAuth
```
GET /api/auth/google
→ Redirects to Google OAuth consent screen

GET /api/auth/google/callback
→ Handles OAuth callback, redirects to client with token
```

#### Update Profile
```
PUT /api/auth/profile
Headers: Authorization: Bearer <token>
Body: { "username": "newname", "avatar": "avatar-url" }
Response: { "user": { updated user object } }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { "user": { current user object } }
```

#### Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { "message": "Logged out successfully" }
```

### Room Endpoints

#### Create Room
```
POST /api/rooms
Headers: Authorization: Bearer <token>
Body: { 
  "name": "Room Name",
  "pin": "1234"
}
Response: {
  "message": "Room created successfully",
  "room": {
    "_id": "room-id",
    "name": "Room Name",
    "code": "ABC12345",
    "createdBy": "user-id",
    "members": ["user-id"],
    "isActive": true
  }
}
```

#### Join Room
```
POST /api/rooms/join
Headers: Authorization: Bearer <token>
Body: {
  "code": "ABC12345",
  "pin": "1234"
}
Response: {
  "message": "Joined room successfully",
  "room": { room object }
}
```

#### Get User's Rooms
```
GET /api/rooms/my-rooms
Headers: Authorization: Bearer <token>
Response: {
  "rooms": [{ room objects }]
}
```

#### Leave Room
```
POST /api/rooms/:roomId/leave
Headers: Authorization: Bearer <token>
Response: { "message": "Left room successfully" }
```

#### Delete Room
```
DELETE /api/rooms/:roomId
Headers: Authorization: Bearer <token>
Response: { "message": "Room deleted successfully" }
Note: Only room creator can delete
```

## WebSocket Events

### Connection
```javascript
// Client connects
socket.connect()

// Server acknowledges
socket.on('connect', () => {...})
```

### Authentication
```javascript
// Client sends token
socket.emit('authenticate', { token: 'jwt-token' })

// Server responds
socket.on('authenticated', (data) => {...})
socket.on('authentication_error', (error) => {...})
```

### Room Management
```javascript
// Join room
socket.emit('join_room', { roomCode: 'ABC12345' })

// Leave room
socket.emit('leave_room', { roomCode: 'ABC12345' })

// Room updates
socket.on('room_users_update', (users) => {...})
```

### Messaging
```javascript
// Send message
socket.emit('send_message', {
  roomCode: 'ABC12345',
  content: 'Hello!',
  senderName: 'John'
})

// Receive message
socket.on('new_message', (message) => {
  // { id, content, senderName, senderId, timestamp }
})
```

### Typing Indicators
```javascript
// User typing
socket.emit('typing', { roomCode: 'ABC12345', username: 'John' })

// User stopped typing
socket.emit('stop_typing', { roomCode: 'ABC12345', username: 'John' })

// Receive typing status
socket.on('user_typing', ({ username }) => {...})
socket.on('user_stopped_typing', ({ username }) => {...})
```

### Presence
```javascript
// User online status updates
socket.on('user_online', ({ userId, username }) => {...})
socket.on('user_offline', ({ userId, username }) => {...})
```

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,           // Required, 2-30 chars
  email: String,              // Required, unique, lowercase
  password: String,           // Optional, bcrypt hashed
  avatar: String,             // Optional, default: ''
  googleId: String,           // Optional, for OAuth users
  isEmailVerified: Boolean,   // Default: false
  isOnline: Boolean,          // Default: false
  lastSeen: Date,            // Default: Date.now
  createdAt: Date,           // Auto-managed
  updatedAt: Date            // Auto-managed
}

// Indexes
email: unique
googleId: sparse (only indexed if exists)
```

**Key Methods:**
- `comparePassword(candidatePassword)` - Compares plain password with hashed

**Hooks:**
- Pre-save: Hashes password before saving if modified

### Rooms Collection

```javascript
{
  _id: ObjectId,
  name: String,              // Required, 1-50 chars
  code: String,              // Required, unique, 8 chars uppercase
  pin: String,               // Required, bcrypt hashed
  createdBy: ObjectId,       // Ref: 'User'
  members: [ObjectId],       // Ref: 'User', current members
  isActive: Boolean,         // Default: true
  emptyAt: Date,            // Timestamp when room became empty
  createdAt: Date,          // Auto-managed
  updatedAt: Date           // Auto-managed
}

// Indexes
code: unique
createdBy: indexed for fast lookup
```

**Room Lifecycle:**
1. Created with random 8-char code and hashed PIN
2. Members join/leave (tracked in `members` array)
3. When last member leaves, `emptyAt` is set
4. Background service deletes rooms empty for > 5 minutes

### Sessions Collection
```javascript
{
  _id: String,              // Session ID
  expires: Date,            // Expiration timestamp
  session: Object           // Session data (user info, etc.)
}
```

Managed automatically by `connect-mongo` for Express sessions.

## Response Status Codes

- **200 OK** - Successful GET request
- **201 Created** - Successful POST (resource created)
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Missing/invalid authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

## Rate Limiting

- API endpoints: 100 requests per 15 minutes per IP
- Socket events: 10 messages per 10 seconds per user
- OTP requests: 3 requests per 15 minutes per email
