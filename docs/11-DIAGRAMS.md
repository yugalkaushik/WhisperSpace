# Visual Architecture Diagrams

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER DEVICES                              │
│                     (Web Browsers - Chrome, Firefox, Safari)        │
└────────────┬────────────────────────────────────────┬───────────────┘
             │ HTTPS                                  │ WSS
             │ (REST API)                             │ (WebSocket)
             ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL CDN                                  │
│                     (Frontend Hosting)                              │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  React Application (SPA)                                   │    │
│  │  ├── Pages (Login, Chat, RoomManager)                     │    │
│  │  ├── Components (ChatRoom, MessageList, UserList)         │    │
│  │  ├── Contexts (Auth, Socket, Theme)                       │    │
│  │  ├── Hooks (useAuth, useSocket, useProfile)               │    │
│  │  └── Services (API client, Socket.IO client)              │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              │ HTTPS Requests / WebSocket Connection
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RENDER/RAILWAY                                   │
│                   (Backend Hosting)                                 │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  Express.js + Socket.IO Server                            │    │
│  │                                                             │    │
│  │  Security Layer:                                           │    │
│  │  ├── Helmet (Security Headers)                            │    │
│  │  ├── CORS (Origin Whitelist)                              │    │
│  │  ├── Rate Limiter (DoS Protection)                        │    │
│  │  └── XSS-Clean (Input Sanitization)                       │    │
│  │                                                             │    │
│  │  Application Layer:                                        │    │
│  │  ├── Authentication Middleware (JWT)                      │    │
│  │  ├── Routes (auth, rooms)                                 │    │
│  │  ├── Controllers (Business Logic)                         │    │
│  │  ├── Socket Handlers (Real-time Events)                   │    │
│  │  └── Background Services (Cleanup, Keep-alive)            │    │
│  │                                                             │    │
│  │  Data Layer:                                               │    │
│  │  └── Mongoose Models (User, Room)                         │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              │ MongoDB Protocol (TCP/IP + TLS)
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MONGODB ATLAS                                  │
│                   (Cloud Database)                                  │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  Collections:                                              │    │
│  │  ├── users (User accounts & profiles)                     │    │
│  │  ├── rooms (Chat room metadata)                           │    │
│  │  └── sessions (OAuth sessions)                            │    │
│  │                                                             │    │
│  │  Features:                                                 │    │
│  │  ├── Automatic Backups                                    │    │
│  │  ├── Encryption at Rest                                   │    │
│  │  ├── Connection Pooling                                   │    │
│  │  └── IP Whitelisting                                      │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

External Services:
┌────────────────────┐
│   Google OAuth     │ ◄── Authentication Flow
│   (OAuth 2.0)      │
└────────────────────┘
```

## Authentication Flow Diagram

```
┌─────────┐                ┌─────────┐               ┌─────────┐              ┌──────────┐
│         │                │         │               │         │              │          │
│ Client  │                │ Server  │               │ Google  │              │ MongoDB  │
│         │                │         │               │  OAuth  │              │          │
└────┬────┘                └────┬────┘               └────┬────┘              └────┬─────┘
     │                          │                         │                        │
     │  1. Click "Sign in      │                         │                        │
     │     with Google"         │                         │                        │
     │─────────────────────────>│                         │                        │
     │                          │                         │                        │
     │  2. Redirect to Google   │                         │                        │
     │  /api/auth/google        │                         │                        │
     │<─────────────────────────│                         │                        │
     │                          │                         │                        │
     │  3. Google Consent Screen│                         │                        │
     │─────────────────────────────────────────────────>│                        │
     │                          │                         │                        │
     │  4. User Approves        │                         │                        │
     │                          │                         │                        │
     │  5. Redirect with Code   │                         │                        │
     │<─────────────────────────────────────────────────│                        │
     │                          │                         │                        │
     │  6. Callback with Code   │                         │                        │
     │─────────────────────────>│                         │                        │
     │                          │                         │                        │
     │                          │  7. Exchange Code      │                        │
     │                          │     for Token          │                        │
     │                          │────────────────────────>│                        │
     │                          │                         │                        │
     │                          │  8. User Profile       │                        │
     │                          │<────────────────────────│                        │
     │                          │                         │                        │
     │                          │  9. Find/Create User                             │
     │                          │─────────────────────────────────────────────────>│
     │                          │                         │                        │
     │                          │ 10. User Document      │                        │
     │                          │<─────────────────────────────────────────────────│
     │                          │                         │                        │
     │                          │ 11. Generate JWT       │                        │
     │                          │     (7-day expiry)     │                        │
     │                          │                         │                        │
     │ 12. Redirect with Token  │                         │                        │
     │<─────────────────────────│                         │                        │
     │                          │                         │                        │
     │ 13. Store Token          │                         │                        │
     │     in localStorage      │                         │                        │
     │                          │                         │                        │
     │ 14. API Requests with    │                         │                        │
     │     Bearer Token         │                         │                        │
     │─────────────────────────>│                         │                        │
     │                          │                         │                        │
     │ 15. Verify JWT &         │                         │                        │
     │     Return Data          │                         │                        │
     │<─────────────────────────│                         │                        │
     │                          │                         │                        │
```

## Real-Time Message Flow Diagram

```
┌──────────┐                ┌──────────────┐                ┌──────────┐
│          │                │              │                │          │
│ Client A │                │   Server     │                │ Client B │
│ (Sender) │                │  Socket.IO   │                │(Receiver)│
│          │                │              │                │          │
└────┬─────┘                └──────┬───────┘                └────┬─────┘
     │                             │                             │
     │  1. Type Message             │                             │
     │     "Hello!"                 │                             │
     │                              │                             │
     │  2. Emit: send_message       │                             │
     │     {content, room}          │                             │
     │─────────────────────────────>│                             │
     │                              │                             │
     │                              │  3. Validate:               │
     │                              │     - Check rate limit      │
     │                              │     - Validate content      │
     │                              │     - Check length          │
     │                              │     - Sanitize XSS          │
     │                              │                             │
     │                              │  4. Create Message Object   │
     │                              │     {_id, content, sender,  │
     │                              │      room, timestamp}       │
     │                              │                             │
     │  5. Emit: new_message        │                             │
     │<─────────────────────────────│                             │
     │                              │                             │
     │  6. Update UI                │  7. Broadcast to Room       │
     │     - Add to messages        │     (io.to(room).emit)      │
     │     - Scroll to bottom       │─────────────────────────────>│
     │                              │                             │
     │                              │                             │  8. Update UI
     │                              │                             │     - Add message
     │                              │                             │     - Scroll down
     │                              │                             │     - Show notification
     │                              │                             │
     │  9. Message displayed on both screens                      │
     │                              │                             │
```

## Room Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Room Lifecycle                               │
└─────────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌─────────────────┐
│  User Creates   │
│     Room        │
│                 │
│  POST /rooms/   │
│   create        │
└────────┬────────┘
         │
         │ Generate Code (AB12CD34)
         │ Hash PIN (bcrypt)
         │ Create MongoDB Document
         ▼
┌─────────────────┐
│   Room Active   │
│   isActive=true │
│   members=[id]  │
└────────┬────────┘
         │
         │◄──── Users Join (POST /rooms/join)
         │      Add to members array
         │      Verify PIN
         │
         │◄──── Socket: join_room event
         │      Add to Socket.IO room
         │      Track in onlineUsers Map
         │
         │◄──── Messages Sent
         │      (Ephemeral - not stored)
         │
         │◄──── Users Leave
         │      Remove from members array
         │      Socket: leave_room event
         │
         ▼
    ┌─────────────┐              ┌──────────────┐
    │ Members > 0 │─────NO──────>│ Members = 0  │
    │   Active    │              │ Set emptyAt  │
    └─────────────┘              └──────┬───────┘
         │                              │
         │ No messages                  │
         │ for 12 hours                 │ Empty for
         │                              │ 10 minutes
         ▼                              │
    ┌─────────────┐                     │
    │  Cleanup    │                     │
    │  Service    │◄────────────────────┘
    │  Triggers   │
    └──────┬──────┘
           │
           │ Room.deleteOne()
           │
           ▼
    ┌─────────────┐
    │   DELETED   │
    │  (Permanent)│
    └─────────────┘
           │
         END
```

## Socket.IO Connection Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                   Socket.IO Connection Flow                        │
└────────────────────────────────────────────────────────────────────┘

Client                                    Server
  │                                         │
  │  1. Initialize Socket.IO                │
  │     with JWT token in auth              │
  │─────────────────────────────────────────>│
  │                                         │
  │                                         │  2. Middleware: Verify JWT
  │                                         │     - Extract token
  │                                         │     - Verify signature
  │                                         │     - Check expiration
  │                                         │     - Load user from DB
  │                                         │
  │  3a. Authentication Success             │
  │     Attach userId & username            │
  │<─────────────────────────────────────────│
  │     OR                                  │
  │  3b. Authentication Failed              │
  │     Disconnect with error               │
  │<─────────────────────────────────────────│
  │                                         │
  │  4. Emit: 'connect' event               │
  │<─────────────────────────────────────────│
  │                                         │
  │  5. Add to onlineUsers Map              │
  │     Update user.isOnline = true         │
  │                                         │
  │  6. Register Event Listeners:           │
  │     - join_room                         │
  │     - leave_room                        │
  │     - send_message                      │
  │     - typing_start                      │
  │     - typing_stop                       │
  │     - disconnect                        │
  │                                         │
  │  7. Ready for Communication             │
  │◄────────────────────────────────────────>│
  │                                         │
  │  Messages, Typing Indicators, etc.      │
  │◄────────────────────────────────────────>│
  │                                         │
  │  8. User Closes Tab/Browser             │
  │     Emit: 'disconnect'                  │
  │─────────────────────────────────────────>│
  │                                         │
  │                                         │  9. Cleanup:
  │                                         │     - Remove from onlineUsers
  │                                         │     - Update DB (isOnline=false)
  │                                         │     - Broadcast to rooms
  │                                         │     - Update room members
  │                                         │     - Delete empty rooms
  │                                         │
  │  Connection Closed                      │
  │                                         │
```

## Data Flow: Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│               Complete User Journey Data Flow                       │
└─────────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION
   Browser ──Google OAuth──> Server ──Create/Find User──> MongoDB
                                │
                                └──Generate JWT──> Browser localStorage

2. PROFILE SETUP
   Browser ──PUT /auth/profile──> Server ──Update User──> MongoDB

3. CREATE/JOIN ROOM
   Browser ──POST /rooms/create──> Server ──Create Room──> MongoDB
       or
   Browser ──POST /rooms/join────> Server ──Find Room───> MongoDB
                                      │
                                      └──Verify PIN (bcrypt)

4. CONNECT SOCKET
   Browser ──Socket.IO + JWT──> Server ──Verify Token──> MongoDB
                                   │                        │
                                   │                        └─Get User
                                   │
                                   └──Add to onlineUsers Map

5. JOIN ROOM (SOCKET)
   Browser ──emit: join_room──> Server ──socket.join(room)
                                   │
                                   ├──Add room to user.rooms
                                   │
                                   ├──Update MongoDB
                                   │  (add user to members)
                                   │
                                   └──Broadcast users_online

6. SEND MESSAGE
   Browser ──emit: send_message──> Server (Validation)
                                      │
                                      ├── Rate limit check
                                      ├── Sanitize XSS
                                      ├── Validate length
                                      │
                                      └──io.to(room).emit
                                            │
                                            ├──> Browser A (sender)
                                            └──> Browser B (receiver)

   NOTE: Message NEVER touches MongoDB - ephemeral only!

7. LEAVE ROOM
   Browser ──emit: leave_room──> Server ──socket.leave(room)
                                    │
                                    ├──Remove from user.rooms
                                    │
                                    ├──MongoDB: $pull from members
                                    │
                                    ├──Check if room empty
                                    │
                                    └──Delete room if empty

8. DISCONNECT
   Browser closes ──disconnect──> Server
                                    │
                                    ├──Remove from onlineUsers
                                    │
                                    ├──Update MongoDB (isOnline=false)
                                    │
                                    ├──For each user's room:
                                    │  ├── Broadcast updated users
                                    │  ├── Remove from members
                                    │  └── Delete if empty
                                    │
                                    └──Close socket connection
```

## Security Layers Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Defense-in-Depth Security                        │
└─────────────────────────────────────────────────────────────────────┘

    User Request/Message
          │
          ▼
    ┌──────────────────┐
    │  Network Layer   │
    │  ════════════════│
    │  - HTTPS/TLS     │
    │  - WSS (Secure   │
    │    WebSocket)    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Infrastructure   │
    │  ════════════════│
    │  - CORS Whitelist│
    │  - Rate Limiting │
    │  - DDoS Protection│
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Application      │
    │  ════════════════│
    │  - Helmet Headers│
    │  - XSS-Clean     │
    │  - Input Size    │
    │    Limits        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Authentication   │
    │  ════════════════│
    │  - JWT Verify    │
    │  - Token Expiry  │
    │  - User Lookup   │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Input Validation │
    │  ════════════════│
    │  - Type Checking │
    │  - Length Limits │
    │  - Format Verify │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Sanitization     │
    │  ════════════════│
    │  - Remove Scripts│
    │  - Remove Iframes│
    │  - Remove Event  │
    │    Handlers      │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Business Logic   │
    │  ════════════════│
    │  - Process Request│
    │  - Generate       │
    │    Response      │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Data Layer      │
    │  ════════════════│
    │  - Mongoose ODM  │
    │  - Schema Valid. │
    │  - Encrypted DB  │
    └────────┬─────────┘
             │
             ▼
        Response to User
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Technology Stack Layers                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                            │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  React 19.1.0 (UI Framework)                              │    │
│  │  ├── Components (Reusable UI)                             │    │
│  │  ├── Pages (Routes)                                       │    │
│  │  └── Hooks (Logic)                                        │    │
│  │                                                             │    │
│  │  TypeScript 5.8.3 (Type Safety)                           │    │
│  │  Tailwind CSS 4.1.11 (Styling)                            │    │
│  │  Vite 7.0.0 (Build Tool)                                  │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT LAYER                         │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  React Context API                                         │    │
│  │  ├── AuthContext (User State)                             │    │
│  │  ├── SocketContext (Real-time State)                      │    │
│  │  └── ThemeContext (UI Preferences)                        │    │
│  │                                                             │    │
│  │  LocalStorage (Persistence)                                │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      COMMUNICATION LAYER                            │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  HTTP Protocol                  WebSocket Protocol         │    │
│  │  ├── Axios 1.10.0               ├── Socket.IO Client      │    │
│  │  ├── REST API Calls             ├── Real-time Events      │    │
│  │  └── JWT Token Auth             └── Room Broadcasting     │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                              │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  Express.js 5.1.0 (Web Framework)                         │    │
│  │  ├── Routes (Endpoint Definitions)                        │    │
│  │  ├── Controllers (Business Logic)                         │    │
│  │  ├── Middleware (Security, Auth)                          │    │
│  │  └── Services (Background Jobs)                           │    │
│  │                                                             │    │
│  │  Socket.IO 4.8.1 (WebSocket Server)                       │    │
│  │  ├── Event Handlers                                       │    │
│  │  ├── Room Management                                      │    │
│  │  └── Broadcasting Logic                                   │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYER                                 │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  Helmet 8.1.0 (Security Headers)                          │    │
│  │  CORS 2.8.5 (Origin Control)                              │    │
│  │  Rate Limiter 8.2.1 (DoS Protection)                      │    │
│  │  XSS-Clean 0.1.4 (Input Sanitization)                     │    │
│  │  Passport.js 0.7.0 (OAuth)                                │    │
│  │  JWT 9.0.2 (Token Auth)                                   │    │
│  │  Bcrypt.js 3.0.2 (Hashing)                                │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                   │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  Mongoose 8.16.1 (ODM)                                    │    │
│  │  ├── Schema Definitions                                   │    │
│  │  ├── Validation                                           │    │
│  │  ├── Middleware Hooks                                     │    │
│  │  └── Query Building                                       │    │
│  │                                                             │    │
│  │  MongoDB Atlas (Database)                                 │    │
│  │  ├── Document Storage                                     │    │
│  │  ├── Indexing                                             │    │
│  │  └── Cloud Hosting                                        │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  Frontend: Vercel (CDN + Static Hosting)                  │    │
│  │  Backend: Render/Railway (Node.js Runtime)                │    │
│  │  Database: MongoDB Atlas (Cloud Database)                 │    │
│  │  OAuth: Google Cloud (Authentication Provider)            │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

These diagrams provide a visual representation of the WhisperSpace architecture, showing how different components interact, data flows through the system, and how security is layered throughout the application.
