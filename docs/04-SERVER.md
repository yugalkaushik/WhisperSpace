# Server Architecture

## Directory Structure

```
server/
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   └── passport.ts      # Passport.js OAuth config
│   ├── controllers/          # Request handlers
│   │   ├── authController.ts # Authentication logic
│   │   └── roomController.ts # Room management logic
│   ├── middleware/           # Express middleware
│   │   └── auth.ts          # JWT authentication
│   ├── models/              # Mongoose models
│   │   ├── User.ts          # User schema
│   │   └── Room.ts          # Room schema
│   ├── routes/              # Route definitions
│   │   ├── auth.ts          # Auth endpoints
│   │   └── rooms.ts         # Room endpoints
│   ├── services/            # Background services
│   │   ├── keepAlive.ts     # Server ping service
│   │   └── roomCleanup.ts   # Room cleanup service
│   ├── types/               # TypeScript definitions
│   │   └── xss-clean.d.ts   # Type definitions
│   ├── utils/               # Utility functions
│   │   └── env.ts           # Environment helpers
│   └── server.ts            # Application entry point
├── dist/                     # Compiled JavaScript
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── Procfile                 # Heroku deployment
└── render.yaml              # Render deployment
```

## Core Architecture

### 1. Application Entry Point

**File**: `server.ts`

**Responsibilities:**
1. Initialize Express application
2. Configure middleware stack
3. Establish database connection
4. Set up Socket.IO server
5. Register routes
6. Start HTTP server
7. Initialize background services

**Startup Sequence:**
```
1. Load environment variables (dotenv)
2. Import dependencies
3. Create Express app
4. Create HTTP server
5. Create Socket.IO instance
6. Connect to MongoDB
7. Apply security middleware
8. Apply session middleware
9. Apply Passport middleware
10. Register routes
11. Set up Socket.IO handlers
12. Start server on PORT
13. Start background services
```

### 2. Middleware Stack

The middleware executes in a specific order to ensure security and proper request processing:

#### Order of Execution

**1. Security Middleware (First Priority)**

```typescript
// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {...},
  crossOriginEmbedderPolicy: false
}));

// XSS Protection - Sanitize input
app.use(xss());

// Rate Limiting - Prevent abuse
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// CORS - Origin whitelist
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));
```

**Why This Order:**
- Security headers applied first
- Input sanitization before parsing
- Rate limiting before processing
- CORS before routing

**2. Body Parsing Middleware**

```typescript
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

**3. Session Middleware**

```typescript
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
```

**4. Authentication Middleware**

```typescript
app.use(passport.initialize());
app.use(passport.session());
```

**5. Route Handlers**

```typescript
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
```

### 3. Configuration Layer

#### Database Configuration (`config/database.ts`)

**Purpose**: Establish and manage MongoDB connection.

**Features:**
- Connection pooling
- Error handling
- Graceful shutdown
- Index management
- Connection event listeners

**Connection Lifecycle:**
```
Start → Connect to MongoDB Atlas → 
Index Management → Event Listeners → 
Handle Errors → Graceful Shutdown
```

#### Passport Configuration (`config/passport.ts`)

**Purpose**: Configure Google OAuth 2.0 strategy.

**Strategy Flow:**
```
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. User approves permissions
4. Google redirects back with authorization code
5. Passport exchanges code for user profile
6. Check if user exists (by googleId or email)
7. Create or update user in database
8. Serialize user to session
9. Return user to callback
```

**User Matching Logic:**
```typescript
1. Find by googleId → If found, return user
2. Find by email → If found, link Google account
3. Neither found → Create new user
```

### 4. Models Layer

#### User Model (`models/User.ts`)

**Schema Definition:**
```typescript
{
  username: String (required, 2-30 chars)
  email: String (required, unique, lowercase)
  password: String (optional, min 6 chars)
  avatar: String (optional)
  googleId: String (optional, sparse index)
  isOnline: Boolean (default: false)
  lastSeen: Date (default: now)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Middleware Hooks:**
- **pre('save')**: Hash password before saving
- **methods.comparePassword**: Compare plaintext with hash
- **methods.toJSON**: Remove sensitive fields from output

**Indexes:**
- email: unique index for fast lookup
- googleId: sparse index (only for OAuth users)

#### Room Model (`models/Room.ts`)

**Schema Definition:**
```typescript
{
  name: String (required, max 50 chars)
  code: String (required, unique, 8 chars, uppercase)
  pin: String (required, 4 digits, hashed)
  creator: ObjectId (ref: User)
  members: [ObjectId] (ref: User)
  isActive: Boolean (default: true)
  emptyAt: Date (nullable)
  lastMessageAt: Date (nullable)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Static Methods:**
- **generateRoomCode()**: Create unique 8-character code

**Indexes:**
- code: unique index for fast room lookup

### 5. Controllers Layer

#### Auth Controller (`controllers/authController.ts`)

**Endpoints:**

**1. Register**
```typescript
POST /api/auth/register
Body: { username, email, password }
Response: { message, token, user }
```

**Process:**
1. Validate input fields
2. Check email uniqueness
3. Create user document
4. Hash password automatically (pre-save hook)
5. Generate JWT token
6. Return token and user data

**2. Login**
```typescript
POST /api/auth/login
Body: { email, password }
Response: { message, token, user }
```

**Process:**
1. Validate credentials
2. Find user by email
3. Compare password with hash
4. Update online status
5. Generate JWT token
6. Return token and user data

**3. Google OAuth Callback**
```typescript
GET /api/auth/google/callback
Query: { code }
Response: Redirect to client with token
```

**Process:**
1. Passport verifies OAuth code
2. Fetch user from Google
3. Create or update user
4. Generate JWT token
5. Redirect to client with token in URL

**4. Get Profile**
```typescript
GET /api/auth/profile
Headers: { Authorization: Bearer <token> }
Response: { user }
```

**Process:**
1. Verify JWT token (middleware)
2. Fetch user from database
3. Return user profile

**5. Update Profile**
```typescript
PUT /api/auth/profile
Headers: { Authorization: Bearer <token> }
Body: { username, avatar }
Response: { message, user }
```

**6. Logout**
```typescript
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { message }
```

**Process:**
1. Update user online status to false
2. Update last seen timestamp
3. Return success message

#### Room Controller (`controllers/roomController.ts`)

**Endpoints:**

**1. Create Room**
```typescript
POST /api/rooms/create
Headers: { Authorization: Bearer <token> }
Body: { name, pin }
Response: { message, roomCode, roomName }
```

**Process:**
1. Validate room name and PIN
2. Generate unique 8-character code
3. Hash PIN with bcrypt
4. Create room document
5. Add creator to members
6. Return room code and name

**2. Join Room**
```typescript
POST /api/rooms/join
Headers: { Authorization: Bearer <token> }
Body: { roomCode, pin }
Response: { message, roomCode, roomName }
```

**Process:**
1. Validate room code and PIN
2. Find room by code
3. Verify PIN with bcrypt
4. Add user to members if not present
5. Return room details

**3. Get Room Info**
```typescript
GET /api/rooms/:roomCode
Headers: { Authorization: Bearer <token> }
Response: { room }
```

**4. Leave Room**
```typescript
DELETE /api/rooms/:roomCode/leave
Headers: { Authorization: Bearer <token> }
Response: { message }
```

**Process:**
1. Find room by code
2. Remove user from members
3. Delete room if empty
4. Return success message

### 6. Middleware Layer

#### Authentication Middleware (`middleware/auth.ts`)

**Purpose**: Verify JWT tokens and attach user to request.

**Process:**
```
1. Extract token from Authorization header
2. Verify token signature and expiration
3. Extract userId from token payload
4. Query database for user
5. Attach user to request object
6. Call next() or return error
```

**Error Handling:**
- No token: 401 Unauthorized
- Invalid token: 403 Forbidden
- Expired token: 401 with specific message
- User not found: 401 with specific message

### 7. Services Layer

#### Room Cleanup Service (`services/roomCleanup.ts`)

**Purpose**: Automatically delete inactive and empty rooms.

**Configuration:**
- Cleanup interval: 5 minutes
- Empty room threshold: 10 minutes
- Inactive room threshold: 12 hours

**Cleanup Logic:**
```typescript
Delete rooms where:
1. No members AND (no messages for 10min OR created >10min ago)
   OR
2. Has members BUT no messages for 12 hours
   OR
3. Marked as empty (emptyAt) for 10 minutes
```

**Methods:**
- `start()`: Begin automatic cleanup
- `stop()`: Stop cleanup service
- `runCleanup()`: Execute cleanup logic
- `getCleanupStats()`: Return statistics
- `manualCleanup()`: Trigger immediate cleanup

**Lifecycle:**
```
Server Start → Start Cleanup Service → 
Run Immediate Cleanup → Schedule Interval (5min) → 
Periodic Cleanup → Server Shutdown → Stop Service
```

#### Keep Alive Service (`services/keepAlive.ts`)

**Purpose**: Prevent server sleep on free-tier hosting platforms.

**Configuration:**
- Ping interval: 14 minutes (free tier timeout is 15min)
- Target: Own server health endpoint

**Process:**
```
1. Check if production environment
2. Start interval timer
3. Send HTTP GET to /api/health
4. Log response
5. Repeat every 14 minutes
```

**Methods:**
- `start(url)`: Begin pinging
- `stop()`: Stop pinging

### 8. Socket.IO Implementation

#### Connection Authentication

**Process:**
```typescript
1. Client sends token in handshake auth
2. Server middleware intercepts
3. Verify JWT token
4. Fetch user from database
5. Attach userId and username to socket
6. Allow connection or reject
```

#### Online Users Tracking

**Data Structure:**
```typescript
Map<userId, {
  socketId: string;
  username: string;
  userId: string;
  rooms: Set<string>;
}>
```

**Lifecycle:**
- **connect**: Add to map
- **join_room**: Add room to user's set
- **leave_room**: Remove room from set
- **disconnect**: Remove from map

#### Socket Events

**Client → Server:**
- `join_room`: Join a chat room
- `leave_room`: Leave a room
- `send_message`: Send message to room
- `typing_start`: Emit typing indicator
- `typing_stop`: Stop typing indicator

**Server → Client:**
- `joined_room`: Confirm room join
- `left_room`: Confirm room leave
- `new_message`: Broadcast message
- `users_online`: Updated online users
- `user_typing`: User started typing
- `user_stop_typing`: User stopped typing
- `error`: Error notification

#### Message Handling

**Security Measures:**
1. Rate limiting (30 messages/minute)
2. Content validation (non-empty, type check)
3. Length limit (5000 characters)
4. XSS sanitization (remove scripts, iframes, event handlers)
5. Room validation
6. Message type validation

**Message Flow:**
```
1. Receive send_message event
2. Apply rate limit
3. Validate content
4. Sanitize content
5. Create message object
6. Broadcast to room members
7. No database storage (ephemeral)
```

#### Room Management

**Join Room:**
```
1. Normalize room code (uppercase, trim)
2. Socket joins room
3. Add room to user's rooms set
4. Update room members in database
5. Emit joined_room to user
6. Broadcast updated users_online to room
```

**Leave Room:**
```
1. Socket leaves room
2. Remove room from user's rooms set
3. Update room members in database
4. Emit left_room to user
5. Broadcast updated users_online to room
6. Delete room if empty
```

**Disconnect:**
```
1. Get user's rooms
2. Remove from online users map
3. Update user status in database
4. For each room:
   - Broadcast updated users_online
   - Update room members
   - Delete room if empty
```

### 9. Environment Configuration

#### Required Variables (`utils/env.ts`)

```typescript
PORT: Server port number
MONGODB_URI: MongoDB connection string
SESSION_SECRET: Session encryption key
JWT_SECRET: JWT signing key
CLIENT_URL: Frontend origin
GOOGLE_CLIENT_ID: OAuth client ID
GOOGLE_CLIENT_SECRET: OAuth secret
GOOGLE_CALLBACK_URL: OAuth redirect URI
```

#### Helper Functions

- `requireEnv()`: Get required string variable
- `requireNumberEnv()`: Get required number variable
- `getClientBaseUrl()`: Get and validate client URL
- `getServerPort()`: Get and parse port number
- `getMongoUri()`: Get database connection string
- `getSessionSecret()`: Get session secret
- `getGoogleCallbackUrl()`: Get OAuth callback URL

### 10. Error Handling

**Global Strategy:**
- Try-catch blocks in all async operations
- Specific error messages for debugging
- Generic error messages for clients
- Proper HTTP status codes
- Logging for server-side errors

**HTTP Error Codes:**
- 400: Bad request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not found (resource doesn't exist)
- 500: Internal server error (unexpected errors)

### 11. Admin Endpoints

**Cleanup Stats:**
```typescript
GET /api/admin/cleanup/stats
Response: { stats }
```

**Manual Cleanup:**
```typescript
POST /api/admin/cleanup/manual
Response: { message, deletedCount }
```

**Mark Room Empty:**
```typescript
POST /api/admin/rooms/:roomCode/mark-empty
Response: { message, room }
```

**Delete All Rooms:**
```typescript
DELETE /api/admin/rooms/all
Response: { message, deletedCount }
```

### 12. Health Check

```typescript
GET /api/health
Response: { status: 'OK', message: 'Server running' }
```

```typescript
GET /
Response: {
  message: 'WhisperSpace Backend Server is Running!',
  status: 'online',
  timestamp: ISO timestamp,
  environment: { NODE_ENV, CLIENT_URL, PORT },
  endpoints: { health, auth, rooms }
}
```
