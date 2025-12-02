# Security & Implementation

## Security Measures

### 1. Authentication & Authorization

**JWT (JSON Web Tokens)**
- Token-based stateless authentication
- 7-day expiration
- Signed with secret key
- Sent via Authorization header: `Bearer <token>`

**Password Security**
- Bcrypt hashing with 12 salt rounds
- Never stored or transmitted in plain text
- Passwords excluded from API responses

**PIN Protection**
- Room PINs hashed with bcrypt before storage
- 4-digit numeric PINs
- Required for joining rooms

**OAuth Integration**
- Google OAuth 2.0 for passwordless login
- Passport.js middleware handles OAuth flow
- User data synced from Google profile

### 2. Network Security

**HTTPS/TLS**
- All production traffic encrypted
- WebSocket upgraded to WSS (WebSocket Secure)
- Enforced via HSTS headers

**CORS (Cross-Origin Resource Sharing)**
- Whitelisted client origins only
- Credentials allowed for authenticated requests
- Prevents unauthorized cross-origin access

```javascript
cors({
  origin: CLIENT_ORIGIN,
  credentials: true
})
```

### 3. Application Security

**Helmet.js - Security Headers**
- Content Security Policy (CSP) - Prevents XSS and code injection
- X-Frame-Options: DENY - Prevents clickjacking
- X-Content-Type-Options: nosniff - Prevents MIME sniffing
- Referrer-Policy: no-referrer - Prevents referrer leakage

**XSS Protection**
- Server-side input sanitization with `xss-clean`
- Custom message sanitization removes:
  - `<script>` tags
  - `<iframe>` tags
  - `javascript:` protocol
  - Inline event handlers (onclick, onload, etc.)
- React automatically escapes rendered content

**Rate Limiting**
- API endpoints: 100 requests per 15 minutes
- Socket events: 10 messages per 10 seconds per user
- Prevents brute force and DDoS attacks

**Input Validation**
- Message length: max 1000 characters
- Username: 2-30 characters
- Room name: 1-50 characters
- Email: valid format, unique
- Mongoose schema validation

### 4. Data Security

**Zero Message Persistence**
- Messages never stored in database
- Exist only in memory during active sessions
- Complete privacy - no chat history

**Session Management**
- Express sessions stored in MongoDB
- Secure session cookies
- Session expiration and cleanup

**Environment Variables**
- Sensitive data (secrets, API keys) in `.env`
- Never committed to version control
- Different configs for dev/production

## Key Implementation Details

### Real-Time Communication

**Socket.IO Architecture**
- Bidirectional event-based communication
- Automatic reconnection on disconnect
- Room-based message isolation
- Fallback to long-polling if WebSocket unavailable

**Event Flow:**
1. Client connects and authenticates with JWT
2. Client joins room (socket room namespace)
3. Messages broadcast to room members only
4. Typing indicators and presence updates in real-time
5. Client disconnects, removed from room

**In-Memory Message Storage:**
- Messages stored in JavaScript objects during runtime
- Cleared when room becomes inactive
- No persistence layer for chat content

### Room Management

**Room Lifecycle:**
1. **Creation**: User creates room with name and PIN
2. **Code Generation**: Random 8-character alphanumeric code
3. **Join**: Users join with code + PIN
4. **Active**: Members tracked in `members` array
5. **Empty**: Last member leaves, `emptyAt` timestamp set
6. **Cleanup**: Background service deletes after 5 min of inactivity

**Automatic Cleanup Service:**
```javascript
// Runs every 5 minutes
setInterval(async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  await Room.deleteMany({
    isActive: false,
    emptyAt: { $lt: fiveMinutesAgo }
  });
}, 5 * 60 * 1000);
```

### State Management (Client)

**React Context API**
- **AuthContext**: User auth state, login/logout
- **SocketContext**: Socket connection, event listeners
- **ThemeContext**: Dark/light mode

**Why Context over Redux:**
- Simpler for small-to-medium apps
- Built into React, no extra dependencies
- Sufficient for this use case
- Custom hooks for easy access

### Email Service

**OTP (One-Time Password) Authentication**
- 6-digit random OTP generated
- Sent via email (Nodemailer)
- Stored in database with 10-minute expiration
- Verified on login, then deleted
- Max 3 OTP requests per email per 15 minutes

**Flow:**
1. User enters email
2. Server generates OTP, saves to DB with expiry
3. Email sent with OTP
4. User enters OTP
5. Server validates OTP and expiry
6. If valid, create JWT and log in user
7. Delete OTP from database

### Background Services

**Room Cleanup Service**
- Deletes inactive rooms every 5 minutes
- Checks `emptyAt` timestamp
- Prevents database bloat

**Keep-Alive Service**
- Pings server every 14 minutes
- Prevents free-tier hosting sleep (Render, Railway)
- Ensures faster response times

## Environment Configuration

### Required Environment Variables

**Server (.env)**
```
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
SESSION_SECRET=session-secret
CLIENT_BASE_URL=http://localhost:5173

GOOGLE_CLIENT_ID=google-oauth-client-id
GOOGLE_CLIENT_SECRET=google-oauth-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password
```

**Client (.env)**
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Deployment Considerations

**Frontend (Vercel)**
- Automatic HTTPS
- Environment variables via dashboard
- Build command: `npm run build`
- Output directory: `dist`

**Backend (Render/Railway)**
- Automatic HTTPS
- Environment variables via dashboard
- Start command: `npm start`
- Build command: `npm run build`

**Database (MongoDB Atlas)**
- Cloud-hosted, auto-scaling
- IP whitelist or allow all (0.0.0.0/0)
- Connection string in environment variable
