# File Connections & Communication Flow

## Complete Request Flow Map

### Authentication Flow (Email/OTP)

**Client → Server → Database**

1. **User enters email** (Client)
   - File: `client/src/pages/Login.tsx`
   - Action: User submits email in `EmailAuthForm` component

2. **Send OTP request** (Client → Server)
   - Client File: `client/src/components/auth/EmailAuthForm.tsx`
   - Calls: `client/src/services/api.ts` → `sendOTP()` function
   - HTTP: `POST /api/auth/send-otp`
   
3. **Handle OTP request** (Server)
   - Route: `server/src/routes/auth.ts` → `/send-otp` endpoint
   - Controller: `server/src/controllers/authController.ts` → `sendOTP()`
   - Service: `server/src/services/emailService.ts` → `sendOTPEmail()`
   - Model: `server/src/models/OTP.ts` → Save OTP to database
   - Database: MongoDB `otps` collection

4. **User enters OTP** (Client)
   - File: `client/src/components/auth/EmailOTPVerification.tsx`
   - Action: User submits 6-digit OTP

5. **Verify OTP request** (Client → Server)
   - Client File: `client/src/components/auth/EmailOTPVerification.tsx`
   - Calls: `client/src/services/api.ts` → `verifyOTP()` function
   - HTTP: `POST /api/auth/verify-otp`

6. **Verify and login** (Server → Database)
   - Route: `server/src/routes/auth.ts` → `/verify-otp` endpoint
   - Controller: `server/src/controllers/authController.ts` → `verifyOTP()`
   - Model: `server/src/models/OTP.ts` → Find and validate OTP
   - Model: `server/src/models/User.ts` → Find or create user
   - Returns: JWT token + user data

7. **Store auth data** (Client)
   - File: `client/src/contexts/AuthContext.tsx` → `setAuthData()`
   - Storage: localStorage (token and user data)
   - State: Updates AuthContext state

---

### Google OAuth Flow

**Client → Server → Google → Server → Client**

1. **Click Google login** (Client)
   - File: `client/src/components/auth/GoogleAuthButton.tsx`
   - Redirects to: `http://localhost:5000/api/auth/google`

2. **Initiate OAuth** (Server → Google)
   - Route: `server/src/routes/auth.ts` → `/auth/google` endpoint
   - Config: `server/src/config/passport.ts` → Google Strategy
   - Redirects to: Google OAuth consent screen

3. **User approves** (Google → Server)
   - Google redirects to: `/api/auth/google/callback`
   - Route: `server/src/routes/auth.ts` → `/auth/google/callback`
   - Config: `server/src/config/passport.ts` → Verify callback
   - Model: `server/src/models/User.ts` → Find or create user
   - Generates: JWT token

4. **Redirect with token** (Server → Client)
   - Redirects to: `client/auth/callback?token=<jwt>`
   - File: `client/src/pages/AuthCallback.tsx` → Extracts token
   - Context: `client/src/contexts/AuthContext.tsx` → Stores token
   - Navigation: Redirects to profile setup or rooms

---

### Room Creation Flow

**Client → Server → Database**

1. **User creates room** (Client)
   - File: `client/src/components/room/RoomManager.tsx`
   - Action: User enters room name and PIN

2. **Create room request** (Client → Server)
   - Client File: `client/src/components/room/RoomManager.tsx`
   - Calls: `client/src/services/api.ts` → `createRoom()`
   - HTTP: `POST /api/rooms`
   - Headers: `Authorization: Bearer <token>`

3. **Handle creation** (Server)
   - Middleware: `server/src/middleware/auth.ts` → `authenticateToken()` (validates JWT)
   - Route: `server/src/routes/rooms.ts` → `POST /` endpoint
   - Controller: `server/src/controllers/roomController.ts` → `createRoom()`
   - Model: `server/src/models/Room.ts` → Create room document
   - Generates: 8-character room code
   - Hashes: PIN with bcrypt
   - Database: MongoDB `rooms` collection

4. **Return room data** (Server → Client)
   - Returns: Room object with code
   - Client: Displays room code to user

---

### Join Room Flow

**Client → Server → Database → WebSocket**

1. **User enters room code & PIN** (Client)
   - File: `client/src/components/room/RoomManager.tsx`
   - Action: User submits code and PIN

2. **Join room request** (Client → Server)
   - Client File: `client/src/components/room/RoomManager.tsx`
   - Calls: `client/src/services/api.ts` → `joinRoom()`
   - HTTP: `POST /api/rooms/join`

3. **Validate and join** (Server)
   - Middleware: `server/src/middleware/auth.ts` → Authenticate
   - Route: `server/src/routes/rooms.ts` → `/join` endpoint
   - Controller: `server/src/controllers/roomController.ts` → `joinRoom()`
   - Model: `server/src/models/Room.ts` → Find room by code
   - Validates: PIN using bcrypt compare
   - Updates: Adds user to `members` array
   - Database: MongoDB `rooms` collection

4. **Navigate to chat** (Client)
   - File: `client/src/pages/RoomManagerPage.tsx`
   - Navigation: Routes to `/transition` then `/chat`
   - File: `client/src/pages/Chat.tsx` → Chat interface loads

5. **Connect to WebSocket** (Client)
   - File: `client/src/contexts/SocketContext.tsx` → Initialize socket
   - Service: `client/src/services/socket.ts` → Create Socket.IO connection
   - Emits: `authenticate` event with JWT token

6. **Authenticate socket** (Server)
   - File: `server/src/server.ts` → Socket.IO event handler
   - Event: `authenticate` listener
   - Validates: JWT token
   - Stores: User data in socket session

7. **Join socket room** (Client → Server)
   - Client: `client/src/components/chat/ChatRoom.tsx`
   - Emits: `join_room` event with room code
   - Server: `server/src/server.ts` → `join_room` handler
   - Action: Adds socket to room namespace
   - Model: `server/src/models/Room.ts` → Updates members
   - Broadcasts: `room_users_update` to all room members

---

### Messaging Flow

**Client → Server → All Clients in Room**

1. **User types message** (Client)
   - File: `client/src/components/chat/MessageInput.tsx`
   - Action: User types and presses enter

2. **Send message event** (Client → Server WebSocket)
   - Client File: `client/src/components/chat/MessageInput.tsx`
   - Service: `client/src/services/socket.ts` → `sendMessage()`
   - Socket Emit: `send_message` event
   - Data: `{ roomCode, content, senderName }`

3. **Process message** (Server)
   - File: `server/src/server.ts` → `send_message` handler
   - Validates: Message length (max 1000 chars)
   - Sanitizes: Removes XSS content (scripts, iframes)
   - Rate Limit: Max 10 messages per 10 seconds
   - Stores: In-memory only (not in database)

4. **Broadcast message** (Server → All Clients in Room)
   - Server: `server/src/server.ts`
   - Socket Broadcast: `new_message` event to room
   - Data: `{ id, content, senderName, senderId, timestamp }`

5. **Display message** (Client)
   - File: `client/src/components/chat/ChatRoom.tsx`
   - Hook: `client/src/hooks/useSocket.ts` → Listens to `new_message`
   - Updates: Messages state array
   - Component: `client/src/components/chat/MessageList.tsx` → Renders messages

---

### Typing Indicators Flow

**Client → Server → Other Clients in Room**

1. **User starts typing** (Client)
   - File: `client/src/components/chat/MessageInput.tsx`
   - Event: `onChange` handler detects typing

2. **Emit typing event** (Client → Server)
   - Socket Emit: `typing` event
   - Data: `{ roomCode, username }`

3. **Broadcast to others** (Server → Other Clients)
   - File: `server/src/server.ts` → `typing` handler
   - Socket Broadcast: `user_typing` to room (except sender)
   - Data: `{ username }`

4. **Show typing indicator** (Client)
   - File: `client/src/components/chat/ChatRoom.tsx`
   - Hook: Listens to `user_typing` event
   - Component: `client/src/components/chat/TypingIndicator.tsx` → Shows "User is typing..."

5. **User stops typing** (Client)
   - Timeout: 3 seconds of inactivity
   - Socket Emit: `stop_typing` event

6. **Hide indicator** (Server → Other Clients)
   - Server: Broadcasts `user_stopped_typing`
   - Client: Removes typing indicator

---

### Profile Update Flow

**Client → Server → Database**

1. **User updates profile** (Client)
   - File: `client/src/pages/ProfileSetup.tsx`
   - Action: User selects avatar and enters username

2. **Update request** (Client → Server)
   - Client File: `client/src/pages/ProfileSetup.tsx`
   - Hook: `client/src/hooks/useProfile.ts` → `updateProfile()`
   - Service: `client/src/services/api.ts` → `updateProfile()`
   - HTTP: `PUT /api/auth/profile`

3. **Update database** (Server)
   - Middleware: `server/src/middleware/auth.ts` → Authenticate
   - Route: `server/src/routes/auth.ts` → `/profile` endpoint
   - Controller: `server/src/controllers/authController.ts` → `updateProfile()`
   - Model: `server/src/models/User.ts` → Update user document
   - Database: MongoDB `users` collection

4. **Update client state** (Client)
   - Returns: Updated user object
   - Context: `client/src/contexts/AuthContext.tsx` → Updates user state
   - Storage: Updates localStorage

---

## Key File Responsibilities

### Client Files

**Services Layer** (API Communication)
- `client/src/services/api.ts` - All HTTP requests (Axios)
- `client/src/services/socket.ts` - Socket.IO client setup

**Context Layer** (Global State)
- `client/src/contexts/AuthContext.tsx` - User authentication state
- `client/src/contexts/SocketContext.tsx` - WebSocket connection state
- `client/src/contexts/ThemeContext.tsx` - Dark/light mode

**Hooks Layer** (Reusable Logic)
- `client/src/hooks/useAuth.ts` - Auth operations
- `client/src/hooks/useSocket.ts` - Socket event listeners
- `client/src/hooks/useProfile.ts` - Profile operations
- `client/src/hooks/useKeepAlive.ts` - Server ping

**Pages Layer** (Routes)
- `client/src/pages/Login.tsx` - Login page
- `client/src/pages/ProfileSetup.tsx` - Profile setup
- `client/src/pages/RoomManagerPage.tsx` - Create/join rooms
- `client/src/pages/Chat.tsx` - Chat interface
- `client/src/pages/AuthCallback.tsx` - OAuth callback handler

**Components Layer**
- `client/src/components/auth/*` - Auth components
- `client/src/components/chat/*` - Chat components
- `client/src/components/room/*` - Room management
- `client/src/components/ui/*` - Reusable UI elements

### Server Files

**Entry Point**
- `server/src/server.ts` - Main server file, Socket.IO handlers

**Routes Layer** (HTTP Endpoints)
- `server/src/routes/auth.ts` - Auth endpoints
- `server/src/routes/rooms.ts` - Room endpoints

**Controllers Layer** (Business Logic)
- `server/src/controllers/authController.ts` - Auth logic
- `server/src/controllers/roomController.ts` - Room logic

**Models Layer** (Database Schemas)
- `server/src/models/User.ts` - User schema
- `server/src/models/Room.ts` - Room schema
- `server/src/models/OTP.ts` - OTP schema

**Middleware Layer**
- `server/src/middleware/auth.ts` - JWT authentication

**Config Layer**
- `server/src/config/database.ts` - MongoDB connection
- `server/src/config/passport.ts` - OAuth configuration

**Services Layer**
- `server/src/services/emailService.ts` - Send emails (OTP)
- `server/src/services/roomCleanup.ts` - Delete inactive rooms
- `server/src/services/keepAlive.ts` - Prevent server sleep

**Utils Layer**
- `server/src/utils/env.ts` - Environment variable helpers

---

## Communication Protocols Summary

### HTTP REST API (Axios)
**Client files**: All make requests through `client/src/services/api.ts`
**Server files**: Routes defined in `server/src/routes/*`
**Used for**: Auth, room creation, profile updates

### WebSocket (Socket.IO)
**Client setup**: `client/src/services/socket.ts` + `client/src/contexts/SocketContext.tsx`
**Server setup**: `server/src/server.ts` (Socket.IO event handlers)
**Used for**: Real-time messaging, typing, presence

### Database (MongoDB + Mongoose)
**Server models**: `server/src/models/*`
**Connection**: `server/src/config/database.ts`
**Collections**: users, rooms, otps, sessions
