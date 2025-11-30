# Database Schema

## Overview

WhisperSpace uses MongoDB as its primary database, accessed through Mongoose ODM (Object-Document Mapper). The database is hosted on MongoDB Atlas cloud platform.

## Collections

The database contains three collections:

1. **users**: User accounts and authentication data
2. **rooms**: Chat room metadata and configuration
3. **sessions**: Express session storage (managed by connect-mongo)

## Schema Definitions

### Users Collection

**Collection Name**: `users`

**Purpose**: Store user authentication data, profile information, and online status.

**Schema**:
```typescript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  username: String,                 // Display name in chat
  email: String,                    // Unique email address
  password: String (optional),      // Hashed password (bcrypt)
  avatar: String (optional),        // Avatar URL or identifier
  googleId: String (optional),      // Google OAuth identifier
  isOnline: Boolean,                // Current online status
  lastSeen: Date,                   // Last activity timestamp
  createdAt: Date,                  // Account creation timestamp
  updatedAt: Date                   // Last modification timestamp
}
```

**Field Details**:

**username**
- Type: String
- Required: true
- Constraints: 2-30 characters, trimmed
- Purpose: Display name shown to other users
- Validation: Minimum length 2, maximum length 30
- Note: Not unique (multiple users can have same username)

**email**
- Type: String
- Required: true
- Constraints: Unique, lowercase, trimmed
- Purpose: Primary authentication identifier
- Validation: Email format, unique constraint
- Index: Unique index for fast lookup and uniqueness enforcement

**password**
- Type: String
- Required: false (OAuth users may not have password)
- Constraints: Minimum 6 characters (before hashing)
- Purpose: Local authentication credential
- Security: Automatically hashed with bcrypt (12 salt rounds) on save
- Storage: Never returned in API responses (removed by toJSON)

**avatar**
- Type: String
- Required: false
- Default: Empty string
- Purpose: User profile picture URL or identifier
- Sources: Google profile photo or user-selected avatar

**googleId**
- Type: String
- Required: false
- Index: Sparse index (only for OAuth users)
- Purpose: Link user account to Google profile
- Usage: OAuth authentication and user matching

**isOnline**
- Type: Boolean
- Default: false
- Purpose: Track real-time user presence
- Updates: Set to true on login/socket connect, false on logout/disconnect

**lastSeen**
- Type: Date
- Default: Current timestamp
- Purpose: Track last user activity
- Updates: Updated on login, logout, and disconnect

**createdAt / updatedAt**
- Type: Date
- Managed by: Mongoose timestamps option
- Purpose: Audit trail for account lifecycle

**Indexes**:
```javascript
email: { unique: true }         // Enforce uniqueness, fast lookup
googleId: { sparse: true }      // Only index documents with googleId
```

**Middleware**:

**Pre-Save Hook** (Password Hashing):
```typescript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

**Methods**:

**comparePassword**:
```typescript
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};
```

**toJSON** (Remove sensitive data):
```typescript
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};
```

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2a$12$KIXvZ8qE.gBxJzR5...", // Hashed
  "avatar": "https://lh3.googleusercontent.com/...",
  "googleId": "103547991597142817347",
  "isOnline": true,
  "lastSeen": "2025-11-30T10:30:00.000Z",
  "createdAt": "2025-11-25T08:00:00.000Z",
  "updatedAt": "2025-11-30T10:30:00.000Z"
}
```

### Rooms Collection

**Collection Name**: `rooms`

**Purpose**: Store chat room configuration, membership, and activity tracking.

**Schema**:
```typescript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  name: String,                     // Room display name
  code: String,                     // Unique 8-character room code
  pin: String,                      // Hashed 4-digit PIN
  creator: ObjectId,                // Reference to User who created room
  members: [ObjectId],              // Array of User references
  isActive: Boolean,                // Room active status
  emptyAt: Date (nullable),         // Timestamp when room became empty
  lastMessageAt: Date (nullable),   // Timestamp of last message
  createdAt: Date,                  // Room creation timestamp
  updatedAt: Date                   // Last modification timestamp
}
```

**Field Details**:

**name**
- Type: String
- Required: true
- Constraints: Maximum 50 characters, trimmed
- Purpose: Human-readable room identifier
- Display: Shown in room list and chat header

**code**
- Type: String
- Required: true
- Constraints: Unique, uppercase, exactly 8 characters
- Format: Alphanumeric (A-Z, 0-9)
- Purpose: Short, shareable room identifier
- Generation: Random generation via static method
- Index: Unique index for fast lookup

**pin**
- Type: String
- Required: true
- Constraints: 4 digits (hashed with bcrypt)
- Purpose: Room access control
- Security: Hashed with bcrypt (10 salt rounds)
- Validation: Verified with bcrypt.compare()

**creator**
- Type: ObjectId
- Required: true
- Reference: User collection
- Purpose: Track room owner
- Usage: Future access control or room management

**members**
- Type: Array of ObjectId
- Reference: User collection
- Purpose: Track current room participants
- Updates: 
  - Add user on join_room socket event
  - Remove user on leave_room or disconnect
- Cleanup: Room deleted when members array empty for 10 minutes

**isActive**
- Type: Boolean
- Default: true
- Purpose: Soft delete flag for inactive rooms
- Usage: Filter out inactive rooms from queries

**emptyAt**
- Type: Date
- Default: null
- Purpose: Track when room became empty
- Usage: Cleanup service deletes rooms empty for >10 minutes
- Updates: Set when last member leaves

**lastMessageAt**
- Type: Date
- Default: null
- Purpose: Track room activity
- Usage: Cleanup service deletes inactive rooms (no messages for 12 hours)
- Updates: Updated when message sent to room
- Note: Currently not implemented (messages not persisted)

**createdAt / updatedAt**
- Type: Date
- Managed by: Mongoose timestamps option
- Purpose: Audit trail for room lifecycle

**Indexes**:
```javascript
code: { unique: true }  // Enforce uniqueness, fast lookup
```

**Static Methods**:

**generateRoomCode**:
```typescript
roomSchema.statics.generateRoomCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
```

**Sample Document**:
```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "Project Team Chat",
  "code": "AB12CD34",
  "pin": "$2a$10$N9qo8uLOickgx2...", // Hashed "1234"
  "creator": "507f1f77bcf86cd799439011",
  "members": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ],
  "isActive": true,
  "emptyAt": null,
  "lastMessageAt": "2025-11-30T10:25:00.000Z",
  "createdAt": "2025-11-30T09:00:00.000Z",
  "updatedAt": "2025-11-30T10:25:00.000Z"
}
```

### Sessions Collection

**Collection Name**: `sessions`

**Purpose**: Store Express session data for Passport.js OAuth flow.

**Schema**: Managed by `connect-mongo`

**Structure**:
```typescript
{
  _id: String,              // Session ID
  expires: Date,            // Expiration timestamp
  session: {                // Session data
    cookie: Object,
    passport: {
      user: ObjectId      // User ID from Passport
    }
  }
}
```

**Configuration**:
```typescript
MongoStore.create({
  mongoUrl: MONGO_URI,
  touchAfter: 24 * 3600  // Lazy update (24 hours)
})
```

**Lifecycle**:
- Created: When user initiates OAuth flow
- Used: During OAuth callback and authentication
- Deleted: After 24 hours of inactivity
- Purpose: Maintain state during multi-step OAuth process

**Sample Document**:
```json
{
  "_id": "sess:FQoJYXdzEPT...",
  "expires": "2025-12-01T10:00:00.000Z",
  "session": {
    "cookie": {
      "originalMaxAge": 86400000,
      "expires": "2025-12-01T10:00:00.000Z",
      "secure": true,
      "httpOnly": true,
      "path": "/"
    },
    "passport": {
      "user": "507f1f77bcf86cd799439011"
    }
  }
}
```

## Relationships

### User-Room Relationship

**Type**: Many-to-Many

**Implementation**:
- Room schema contains `members` array with User ObjectId references
- User schema does not store room references (reduces coupling)
- Relationships tracked in real-time via Socket.IO
- Relationships cleaned up automatically when room deleted

**Diagram**:
```
User 1 ────┐
           ├───> Room A
User 2 ────┤
           │
User 3 ────┘
           
User 2 ────┐
           ├───> Room B
User 4 ────┘
```

### Room-Creator Relationship

**Type**: One-to-Many (One user can create many rooms)

**Implementation**:
- Room schema contains `creator` field with User ObjectId
- Reference only (not enforced constraint)
- Creator can delete or close room (future feature)

## Data Lifecycle

### User Lifecycle

```
Registration/OAuth → Create User Document → 
Active Usage → Update isOnline/lastSeen → 
Logout → Set isOnline=false → 
Account Persists Indefinitely
```

**Note**: No automatic user deletion currently implemented.

### Room Lifecycle

```
Create Room → Generate Code → Hash PIN → 
Add Creator to Members → Active State → 
Users Join/Leave → Update Members Array → 
Cleanup Triggers → Delete Room
```

**Cleanup Triggers**:
1. Empty for 10 minutes: `members.length === 0 && createdAt < 10min ago`
2. Inactive for 12 hours: `members.length > 0 && lastMessageAt < 12hr ago`

### Session Lifecycle

```
OAuth Start → Create Session → 
OAuth Callback → Read Session → 
Complete Authentication → Session No Longer Needed → 
Expires After 24hr
```

## Database Operations

### Common Queries

**Find User by Email**:
```typescript
User.findOne({ email: email.toLowerCase() })
```

**Find User by Google ID**:
```typescript
User.findOne({ googleId: googleId })
```

**Find Room by Code**:
```typescript
Room.findOne({ code: code.toUpperCase(), isActive: true })
```

**Get Online Users**:
```typescript
User.find({ isOnline: true })
```

**Find Inactive Rooms**:
```typescript
Room.find({
  $or: [
    { members: { $size: 0 }, createdAt: { $lt: threshold } },
    { members: { $ne: [] }, lastMessageAt: { $lt: threshold } }
  ]
})
```

### Write Operations

**Update User Online Status**:
```typescript
User.findByIdAndUpdate(userId, {
  isOnline: true,
  lastSeen: new Date()
})
```

**Add User to Room**:
```typescript
Room.findOneAndUpdate(
  { code: roomCode },
  { 
    $addToSet: { members: userId },
    $set: { isActive: true, emptyAt: null }
  },
  { new: true }
)
```

**Remove User from Room**:
```typescript
Room.findOneAndUpdate(
  { code: roomCode },
  { $pull: { members: userId } },
  { new: true }
)
```

**Delete Empty Rooms**:
```typescript
Room.deleteMany({
  members: { $size: 0 },
  createdAt: { $lt: threshold }
})
```

## Performance Considerations

### Indexes

**users.email**: Unique index
- Fast email lookups during login
- Ensures email uniqueness
- Supports user registration checks

**users.googleId**: Sparse index
- Fast OAuth user matching
- Only indexes documents with googleId
- Reduces index size

**rooms.code**: Unique index
- Fast room lookups by code
- Ensures code uniqueness
- Supports room join operations

### Connection Pooling

Mongoose maintains a connection pool to MongoDB Atlas:
- Default pool size: 5 connections
- Automatic connection management
- Reconnection on failure

### Query Optimization

**Projection**: Select only needed fields
```typescript
User.findById(userId).select('-password')
```

**Lean Queries**: Return plain JavaScript objects
```typescript
Room.find({}).lean()
```

**Limit Results**: Prevent large result sets
```typescript
User.find({ isOnline: true }).limit(100)
```

## Data Integrity

### Constraints

**Unique Constraints**:
- User email must be unique
- Room code must be unique

**Referential Integrity**:
- Not enforced at database level
- Handled by application logic
- Orphaned references cleaned up by services

### Validation

**Schema-Level**:
- Mongoose schema validation
- Type checking
- Required fields
- Min/max length

**Application-Level**:
- Controller validation
- Express-validator middleware
- Business logic validation

## Backup and Recovery

**MongoDB Atlas Automatic Backups**:
- Continuous backups
- Point-in-time recovery
- Retention: 7 days (free tier)
- Restore via Atlas UI

**Data Export**:
```bash
mongodump --uri="MONGODB_URI"
```

**Data Import**:
```bash
mongorestore --uri="MONGODB_URI" dump/
```

## Database Security

**Authentication**: Username/password required
**Authorization**: Role-based access control
**Encryption**: 
- At rest (Atlas default)
- In transit (TLS/SSL)
**Network**: IP whitelist for access control
**Auditing**: Atlas audit logs available
