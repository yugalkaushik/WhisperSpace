# API Reference

## Base URL

**Development**: `http://localhost:5000/api`

## Authentication

Most endpoints require JWT authentication via Bearer token.

**Header Format**:
```
Authorization: Bearer <jwt-token>
```

**Token Acquisition**: Obtained from login or OAuth callback.

**Token Expiration**: 7 days from issuance.

## Response Format

### Success Response

```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error Response

```json
{
  "message": "Error description",
  "errors": [ /* optional validation errors */ ]
}
```

## HTTP Status Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request (resource created)
- `400 Bad Request`: Validation error or invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource does not exist
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error

## Endpoints

### Authentication Endpoints

#### Register User

**Endpoint**: `POST /auth/register`

**Authentication**: Not required

**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation**:
- `username`: Required, 2-30 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Success Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "",
    "isOnline": false,
    "lastSeen": "2025-11-30T10:00:00.000Z",
    "createdAt": "2025-11-30T10:00:00.000Z",
    "updatedAt": "2025-11-30T10:00:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "message": "All fields are required"
}
```

```json
{
  "message": "Password must be at least 6 characters"
}
```

```json
{
  "message": "Email already registered"
}
```

---

#### Login User

**Endpoint**: `POST /auth/login`

**Authentication**: Not required

**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation**:
- `email`: Required
- `password`: Required

**Success Response** (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "",
    "isOnline": true,
    "lastSeen": "2025-11-30T10:00:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "message": "Email and password are required"
}
```

401 Unauthorized:
```json
{
  "message": "Invalid credentials"
}
```

---

#### Google OAuth

**Endpoint**: `GET /auth/google`

**Authentication**: Not required

**Description**: Redirects to Google OAuth consent screen.

**Flow**:
1. User clicks "Sign in with Google"
2. Redirect to `/auth/google`
3. Google handles authentication
4. Redirect to `/auth/google/callback`
5. Backend processes OAuth response
6. Redirect to client with token

---

#### Google OAuth Callback

**Endpoint**: `GET /auth/google/callback`

**Authentication**: Handled by Passport.js

**Description**: Handles OAuth callback from Google.

**Success**: Redirects to client with token in URL
```
https://client-url/auth/callback?token=jwt-token
```

**Error**: Redirects to login with error
```
https://client-url/login?error=auth_failed
```

---

#### Get User Profile

**Endpoint**: `GET /auth/profile`

**Authentication**: Required (Bearer token)

**Description**: Retrieve authenticated user's profile.

**Success Response** (200 OK):
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://lh3.googleusercontent.com/...",
    "isOnline": true,
    "lastSeen": "2025-11-30T10:00:00.000Z"
  }
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "message": "Authentication token required"
}
```

```json
{
  "message": "Invalid authentication token"
}
```

```json
{
  "message": "User account not found. Please login again."
}
```

---

#### Update User Profile

**Endpoint**: `PUT /auth/profile`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "username": "new_username",
  "avatar": "avatar-identifier-or-url"
}
```

**Validation**:
- `username`: Optional, 2-30 characters
- `avatar`: Optional, string

**Success Response** (200 OK):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "new_username",
    "email": "john@example.com",
    "avatar": "avatar-identifier-or-url",
    "isOnline": true
  }
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "message": "User not authenticated"
}
```

---

#### Logout

**Endpoint**: `POST /auth/logout`

**Authentication**: Required (Bearer token)

**Description**: Update user online status to offline.

**Success Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

---

### Room Endpoints

#### Create Room

**Endpoint**: `POST /rooms/create`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "name": "Project Team Chat",
  "pin": "1234"
}
```

**Validation**:
- `name`: Required, max 50 characters
- `pin`: Required, exactly 4 digits

**Success Response** (201 Created):
```json
{
  "message": "Room created successfully",
  "roomCode": "AB12CD34",
  "roomName": "Project Team Chat"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "message": "Room name and PIN are required"
}
```

```json
{
  "message": "PIN must be exactly 4 digits"
}
```

401 Unauthorized:
```json
{
  "message": "Unauthorized"
}
```

---

#### Join Room

**Endpoint**: `POST /rooms/join`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "roomCode": "AB12CD34",
  "pin": "1234"
}
```

**Validation**:
- `roomCode`: Required, 8 characters
- `pin`: Required, 4 digits

**Success Response** (200 OK):
```json
{
  "message": "Successfully joined room",
  "roomCode": "AB12CD34",
  "roomName": "Project Team Chat"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "message": "Room code and PIN are required"
}
```

```json
{
  "message": "PIN must be exactly 4 digits"
}
```

401 Unauthorized (Invalid PIN):
```json
{
  "message": "Invalid PIN"
}
```

404 Not Found:
```json
{
  "message": "Room not found or inactive"
}
```

---

#### Get Room Info

**Endpoint**: `GET /rooms/:roomCode`

**Authentication**: Required (Bearer token)

**Parameters**:
- `roomCode`: Room code (8 characters)

**Success Response** (200 OK):
```json
{
  "room": {
    "_id": "507f191e810c19729de860ea",
    "name": "Project Team Chat",
    "code": "AB12CD34",
    "creator": "507f1f77bcf86cd799439011",
    "members": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012"
    ],
    "isActive": true,
    "createdAt": "2025-11-30T09:00:00.000Z",
    "updatedAt": "2025-11-30T10:00:00.000Z"
  }
}
```

**Error Responses**:

404 Not Found:
```json
{
  "message": "Room not found"
}
```

---

#### Leave Room

**Endpoint**: `DELETE /rooms/:roomCode/leave`

**Authentication**: Required (Bearer token)

**Parameters**:
- `roomCode`: Room code (8 characters)

**Success Response** (200 OK):
```json
{
  "message": "Successfully left room"
}
```

**Error Responses**:

404 Not Found:
```json
{
  "message": "Room not found"
}
```

---

### Admin Endpoints

**Note**: These endpoints are currently unprotected. In production, add admin authentication.

#### Get Cleanup Statistics

**Endpoint**: `GET /admin/cleanup/stats`

**Authentication**: Not required (should be protected)

**Description**: Get statistics about room cleanup service.

**Success Response** (200 OK):
```json
{
  "totalRooms": 10,
  "activeRooms": 5,
  "emptyRooms": 3,
  "inactiveRooms": 2,
  "upcomingCleanup": [
    {
      "code": "AB12CD34",
      "name": "Old Room",
      "reason": "empty",
      "emptyAt": "2025-11-30T09:50:00.000Z"
    }
  ]
}
```

---

#### Manual Cleanup

**Endpoint**: `POST /admin/cleanup/manual`

**Authentication**: Not required (should be protected)

**Description**: Trigger immediate room cleanup.

**Success Response** (200 OK):
```json
{
  "message": "Manual cleanup completed",
  "deletedCount": 3,
  "deletedRooms": [
    "AB12CD34",
    "EF56GH78"
  ]
}
```

---

#### Mark Room Empty

**Endpoint**: `POST /admin/rooms/:roomCode/mark-empty`

**Authentication**: Not required (should be protected)

**Description**: Manually mark a room as empty for testing.

**Parameters**:
- `roomCode`: Room code (8 characters)

**Success Response** (200 OK):
```json
{
  "message": "Room AB12CD34 marked as empty",
  "room": {
    "_id": "507f191e810c19729de860ea",
    "code": "AB12CD34",
    "emptyAt": "2025-11-30T10:00:00.000Z",
    "isActive": false
  }
}
```

**Error Responses**:

404 Not Found:
```json
{
  "message": "Room not found"
}
```

---

#### Delete All Rooms

**Endpoint**: `DELETE /admin/rooms/all`

**Authentication**: Not required (should be protected)

**Description**: Delete all rooms (for testing purposes).

**Success Response** (200 OK):
```json
{
  "message": "Deleted all rooms",
  "deletedCount": 10
}
```

---

### Utility Endpoints

#### Health Check

**Endpoint**: `GET /health`

**Authentication**: Not required

**Description**: Check if server is running.

**Success Response** (200 OK):
```json
{
  "status": "OK",
  "message": "ChatFlow server is running"
}
```

---

#### Root Endpoint

**Endpoint**: `GET /`

**Authentication**: Not required

**Description**: Server information and available endpoints.

**Success Response** (200 OK):
```json
{
  "message": "WhisperSpace Backend Server is Running! 🚀",
  "status": "online",
  "timestamp": "2025-11-30T10:00:00.000Z",
  "environment": {
    "NODE_ENV": "production",
    "CLIENT_URL": "https://whisperspace.vercel.app",
    "PORT": 5000
  },
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth/*",
    "rooms": "/api/rooms/*"
  }
}
```

---

## Socket.IO Events

### Client → Server Events

#### join_room

**Description**: Join a chat room

**Payload**:
```typescript
{
  room: "AB12CD34"
}
```

**Server Response Events**:
- `joined_room`: Confirmation
- `users_online`: Updated user list
- `error`: If room code invalid

---

#### leave_room

**Description**: Leave current room

**Payload**:
```typescript
{
  room: "AB12CD34"
}
```

**Server Response Events**:
- `left_room`: Confirmation
- `users_online`: Updated user list

---

#### send_message

**Description**: Send message to room

**Payload**:
```typescript
{
  content: "Hello, world!",
  room: "AB12CD34",
  messageType: "text"
}
```

**Validation**:
- `content`: Required, 1-5000 characters
- `room`: Required, valid room code
- `messageType`: Optional, default "text"

**Server Response Events**:
- `new_message`: Broadcast to room
- `error`: If validation fails or rate limit exceeded

---

#### typing_start

**Description**: Indicate user is typing

**Payload**:
```typescript
{
  room: "AB12CD34"
}
```

**Server Response Events**:
- `user_typing`: Broadcast to others in room

---

#### typing_stop

**Description**: Indicate user stopped typing

**Payload**:
```typescript
{
  room: "AB12CD34"
}
```

**Server Response Events**:
- `user_stop_typing`: Broadcast to others in room

---

### Server → Client Events

#### joined_room

**Description**: Confirmation of room join

**Payload**:
```typescript
"AB12CD34"
```

---

#### left_room

**Description**: Confirmation of room leave

**Payload**:
```typescript
"AB12CD34"
```

---

#### new_message

**Description**: New message in room

**Payload**:
```typescript
{
  _id: "1732961234567-a1b2c3d4",
  content: "Hello, world!",
  sender: {
    _id: "507f1f77bcf86cd799439011",
    username: "john_doe",
    isOnline: true
  },
  room: "AB12CD34",
  messageType: "text",
  createdAt: "2025-11-30T10:00:00.000Z",
  isEdited: false
}
```

---

#### users_online

**Description**: Updated list of online users in room

**Payload**:
```typescript
[
  {
    socketId: "socket-id-1",
    username: "john_doe",
    userId: "507f1f77bcf86cd799439011",
    rooms: Set(["AB12CD34"])
  },
  {
    socketId: "socket-id-2",
    username: "jane_smith",
    userId: "507f1f77bcf86cd799439012",
    rooms: Set(["AB12CD34"])
  }
]
```

---

#### user_typing

**Description**: User started typing

**Payload**:
```typescript
{
  username: "john_doe",
  userId: "507f1f77bcf86cd799439011"
}
```

---

#### user_stop_typing

**Description**: User stopped typing

**Payload**:
```typescript
{
  username: "john_doe",
  userId: "507f1f77bcf86cd799439011"
}
```

---

#### error

**Description**: Error notification

**Payload**:
```typescript
{
  message: "Error description"
}
```

**Common Errors**:
- "Authentication error"
- "Room code is required"
- "Invalid message content"
- "Message too long (max 5000 chars)"
- "You are sending messages too fast. Please slow down."

---

## Rate Limiting

### HTTP Endpoints

**Global Rate Limit**:
- Window: 15 minutes
- Max Requests: 100
- Scope: Per IP address

**Auth Endpoints Rate Limit**:
- Window: 15 minutes
- Max Requests: 5
- Scope: Per IP address
- Applied to: `/auth/register`, `/auth/login`

**Response** (429 Too Many Requests):
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

### Socket Events

**Message Rate Limit**:
- Window: 1 minute
- Max Messages: 30
- Scope: Per user (userId)

**Response Event**: `error`
```typescript
{
  message: "You are sending messages too fast. Please slow down."
}
```

## Error Handling

### Validation Errors

Returned as 400 Bad Request with specific message.

### Authentication Errors

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Valid token but insufficient permissions

### Resource Errors

- `404 Not Found`: Resource does not exist

### Server Errors

- `500 Internal Server Error`: Unexpected error, check server logs

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Handle token expiration** gracefully on client
3. **Implement retry logic** for transient failures
4. **Validate input** on client before sending
5. **Handle rate limits** with user-friendly messages
6. **Use HTTPS** in production
7. **Store tokens securely** (localStorage, not cookies for API)
8. **Implement proper error handling** for all API calls
