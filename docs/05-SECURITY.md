# Security Implementation

## Security Philosophy

WhisperSpace implements defense-in-depth security with multiple layers of protection. Each layer addresses specific threat vectors while working together to create a comprehensive security posture.

## Security Layers

### Layer 1: Network Security

#### HTTPS/TLS Encryption
**Implementation**: All production traffic encrypted via TLS 1.2+

**Purpose**: Protect data in transit from eavesdropping and man-in-the-middle attacks.

**Configuration**:
- Hosting platforms (Vercel, Render) provide automatic TLS
- WebSocket connections upgraded to WSS (WebSocket Secure)
- HTTP Strict Transport Security (HSTS) via Helmet

#### CORS Protection
**Implementation**: `cors` middleware with origin whitelist

**Configuration**:
```typescript
cors({
  origin: CLIENT_ORIGIN, // Only allow specific client
  credentials: true      // Allow cookies/auth headers
})
```

**Purpose**: Prevent unauthorized cross-origin requests.

**Protection Against**:
- Cross-Site Request Forgery (CSRF)
- Unauthorized API access from other domains
- Data theft via malicious websites

### Layer 2: Application Security

#### Helmet.js Security Headers

**Implementation**: Comprehensive HTTP security headers

**Headers Applied**:

1. **Content-Security-Policy (CSP)**
```typescript
{
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", CLIENT_ORIGIN],
  fontSrc: ["'self'", "data:"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"]
}
```

**Protection**: XSS, clickjacking, code injection

2. **X-Frame-Options**: DENY
   - Prevents clickjacking attacks

3. **X-Content-Type-Options**: nosniff
   - Prevents MIME type sniffing

4. **X-XSS-Protection**: 1; mode=block
   - Legacy XSS protection for older browsers

5. **Referrer-Policy**: no-referrer
   - Prevents referrer leakage

#### XSS Protection

**Multiple Layers**:

1. **Server-Side Sanitization** (`xss-clean` middleware)
   - Removes malicious HTML/JavaScript from request bodies
   - Applied before parsing JSON

2. **Message Content Sanitization** (Custom implementation)
```typescript
sanitizedContent = content
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  .replace(/javascript:/gi, '')
  .replace(/on\w+\s*=/gi, '');
```

**Removes**:
- Script tags
- Iframe tags
- JavaScript protocol handlers
- Inline event handlers (onclick, onload, etc.)

3. **Client-Side Escaping**
   - React automatically escapes content
   - Prevents injection through JSX

**Attack Scenarios Prevented**:
```javascript
// Attempted XSS attack
"<script>alert('XSS')</script>"
// Sanitized output
"alert('XSS')"

// Event handler injection
"<img src=x onerror=alert('XSS')>"
// Sanitized output
"<img src=x >"
```

#### Rate Limiting

**Implementation**: `express-rate-limit` middleware

**Global Rate Limit**:
```typescript
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 100 requests per window
  message: 'Too many requests, please try again later.'
}
```

**Auth Route Rate Limit** (Stricter):
```typescript
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 login attempts
  skipSuccessfulRequests: true
}
```

**Socket Event Rate Limit** (Custom implementation):
```typescript
{
  windowMs: 60 * 1000,  // 1 minute
  max: 30,              // 30 messages
  per: userId
}
```

**Protection Against**:
- Brute force attacks
- Denial of Service (DoS)
- Password guessing
- Account enumeration
- API abuse
- Message spam

**Response**: 429 Too Many Requests

#### Input Validation

**Request Body Size Limit**:
```typescript
express.json({ limit: '10kb' })
express.urlencoded({ limit: '10kb' })
```

**Purpose**: Prevent large payload attacks that could:
- Consume server memory
- Cause buffer overflows
- Enable DoS attacks

**Field-Level Validation**:

**User Registration**:
```typescript
- username: 2-30 characters, required
- email: valid email format, required, unique
- password: minimum 6 characters, required
```

**Room Creation**:
```typescript
- name: max 50 characters, required
- pin: exactly 4 digits, required
```

**Message Sending**:
```typescript
- content: 1-5000 characters, required, non-empty after trim
- room: valid room code, required
- messageType: enum ['text', 'emoji', 'image']
```

**Validation Libraries**:
- `express-validator` for API endpoints
- TypeScript type system for compile-time checks
- Runtime checks in controllers

**Error Responses**:
```json
{
  "message": "Validation error description",
  "errors": [/* specific field errors */]
}
```

### Layer 3: Authentication & Authorization

#### JWT Authentication

**Token Generation**:
```typescript
jwt.sign(
  { userId: user._id },
  JWT_SECRET,
  { expiresIn: '7d' }
)
```

**Token Structure**:
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { userId: "...", iat: timestamp, exp: timestamp }
Signature: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

**Storage**:
- Client: localStorage (accessible only to same origin)
- Transmission: Authorization header (Bearer scheme)

**Verification Process**:
```
1. Extract token from Authorization header
2. Verify signature with JWT_SECRET
3. Check expiration timestamp
4. Extract userId from payload
5. Query database for user existence
6. Attach user to request
```

**Security Properties**:
- Signed (integrity verification)
- Expiring (limited validity)
- Stateless (no server-side storage)
- Tamper-proof (signature validation)

**Token Expiration Handling**:
- 7-day validity period
- Client redirects to login on 401
- User must re-authenticate

#### OAuth 2.0 (Google)

**Flow**: Authorization Code Grant

**Steps**:
```
1. Client redirects to Google OAuth consent screen
2. User authenticates with Google
3. User grants permissions
4. Google redirects to callback with authorization code
5. Server exchanges code for access token
6. Server retrieves user profile from Google
7. Server creates/updates user in database
8. Server generates JWT for client
9. Server redirects client with JWT
```

**Security Benefits**:
- No password storage
- Delegated authentication to trusted provider
- Reduced attack surface
- Industry-standard protocol

**Configuration**:
```typescript
{
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}
```

**User Linking**:
- Match by googleId (primary)
- Match by email (secondary)
- Create new user if neither match
- Link Google account to existing email user

#### Session Management

**Store**: MongoDB (connect-mongo)

**Configuration**:
```typescript
{
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    touchAfter: 24 * 3600 // Update session every 24 hours
  }),
  cookie: {
    secure: true (production only),
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}
```

**Purpose**:
- Maintain OAuth state during login
- Passport.js session storage
- CSRF protection via session tokens

**Security Properties**:
- HttpOnly cookies (not accessible to JavaScript)
- Secure flag in production (HTTPS only)
- SameSite protection against CSRF
- Session expiration

#### Socket.IO Authentication

**Handshake Authentication**:
```typescript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.userId);
  
  if (!user) return next(new Error('User not found'));
  
  socket.userId = user._id.toString();
  socket.username = user.username;
  next();
});
```

**Connection Requirements**:
- Valid JWT token in handshake
- User exists in database
- Token not expired

**Authorization**:
- Room access requires join_room event
- Messages only sent to rooms user has joined
- Users can only leave rooms they're in

### Layer 4: Data Security

#### Password Hashing

**Algorithm**: bcrypt with salt rounds = 12

**Implementation**:
```typescript
// Hashing (pre-save hook)
const salt = await bcrypt.genSalt(12);
this.password = await bcrypt.hash(this.password, salt);

// Verification
const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
```

**Security Properties**:
- One-way hashing (irreversible)
- Salt prevents rainbow table attacks
- High cost factor (12 rounds) slows brute force
- Each password has unique salt

**Attack Resistance**:
- Rainbow tables: Defeated by salting
- Brute force: Slowed by computational cost
- Timing attacks: Constant-time comparison

#### PIN Hashing

**Algorithm**: bcrypt with salt rounds = 10

**Implementation**:
```typescript
const hashedPin = await bcrypt.hash(pin, 10);
const isPinValid = await bcrypt.compare(pin, hashedPin);
```

**Purpose**: Protect room PINs even if database compromised

#### Sensitive Data Handling

**Password Removal from Responses**:
```typescript
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};
```

**No Message Persistence**:
- Messages never stored in database
- Ephemeral in-memory only
- Automatically lost on disconnect
- No historical record

**Database Encryption**:
- MongoDB Atlas encryption at rest
- TLS for data in transit
- Access control via IP whitelist

### Layer 5: Privacy Protections

#### Ephemeral Messaging

**Implementation**: No database storage for messages

**Benefits**:
- No permanent record
- Privacy by design
- Compliance with privacy regulations
- Reduced data breach impact

**Message Lifecycle**:
```
Create → Transmit via Socket.IO → Render on Client → 
User Disconnects → Message Lost Forever
```

#### Room Auto-Deletion

**Triggers**:
1. Empty for 10 minutes (no members)
2. Inactive for 12 hours (no messages)

**Benefits**:
- Automatic cleanup
- No lingering data
- Resource efficiency
- Privacy preservation

#### Minimal Data Collection

**Stored Data**:
- Username (required for chat)
- Email (authentication only)
- Avatar (optional)
- Online status (temporary)
- Last seen (temporary)

**Not Stored**:
- Chat messages
- IP addresses
- Usage analytics
- Browsing history
- Device fingerprints

### Layer 6: Infrastructure Security

#### Environment Variables

**Sensitive Configuration**:
```
JWT_SECRET: Random 256-bit key
SESSION_SECRET: Random 256-bit key
MONGODB_URI: Database connection string with credentials
GOOGLE_CLIENT_SECRET: OAuth secret
```

**Protection**:
- Never committed to version control
- Stored in platform-specific secrets manager
- Loaded via dotenv at runtime
- Different values per environment

**Validation**:
```typescript
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing: ${key}`);
  return value;
};
```

#### MongoDB Security

**Connection Security**:
- TLS/SSL encryption
- Authentication required
- IP address whitelist
- Connection string not exposed

**Database Security**:
- Encryption at rest (Atlas default)
- Role-based access control
- Audit logging
- Regular backups

**Mongoose Protection**:
- Parameterized queries (no SQL injection)
- Schema validation
- Type safety via TypeScript

## Threat Model

### Threats Mitigated

1. **Cross-Site Scripting (XSS)**
   - Multiple sanitization layers
   - Content Security Policy
   - React auto-escaping

2. **Cross-Site Request Forgery (CSRF)**
   - CORS whitelist
   - SameSite cookies
   - Token-based auth (not cookie-based)

3. **SQL/NoSQL Injection**
   - Mongoose parameterized queries
   - Input validation
   - Type system

4. **Man-in-the-Middle (MITM)**
   - HTTPS/TLS encryption
   - HSTS headers
   - Secure WebSocket (WSS)

5. **Brute Force Attacks**
   - Rate limiting
   - Account lockout (via rate limit)
   - Strong password hashing

6. **Session Hijacking**
   - HttpOnly cookies
   - Secure flag
   - Short expiration
   - Token verification

7. **Denial of Service (DoS)**
   - Rate limiting
   - Request size limits
   - Connection limits
   - Resource monitoring

8. **Data Breaches**
   - Password hashing
   - No message persistence
   - Minimal data storage
   - Encryption at rest

### Residual Risks

1. **DDoS Attacks**: Large-scale distributed attacks may overwhelm rate limiting
2. **Zero-Day Vulnerabilities**: Unknown exploits in dependencies
3. **Social Engineering**: Users tricked into revealing credentials
4. **Insider Threats**: Database admin access could expose data
5. **Client-Side Attacks**: Malware on user devices

## Security Best Practices

### Development
- Dependency scanning (npm audit)
- TypeScript for type safety
- Code review process
- Minimal dependencies

### Deployment
- Environment separation
- Secrets management
- Automated security updates
- HTTPS everywhere

### Monitoring
- Error logging
- Rate limit alerts
- Failed authentication tracking
- Unusual activity detection

### Maintenance
- Regular dependency updates
- Security patch application
- Periodic security audits
- Incident response planning
