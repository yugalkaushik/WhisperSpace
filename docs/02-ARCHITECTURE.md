# System Architecture

## Overview

WhisperSpace implements a three-tier architecture separating the presentation layer, application layer, and data layer. The system uses both HTTP and WebSocket protocols to provide RESTful APIs and real-time communication.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React Application (Vite)                          │    │
│  │  ├── Components (UI Layer)                         │    │
│  │  ├── Contexts (State Management)                   │    │
│  │  ├── Hooks (Business Logic)                        │    │
│  │  ├── Services (API/Socket Communication)           │    │
│  │  └── Pages (Route Components)                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER TIER                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Express.js Application                            │    │
│  │  ├── Security Middleware (Helmet, CORS, etc.)     │    │
│  │  ├── Authentication (Passport, JWT)                │    │
│  │  ├── Routes (REST API Endpoints)                   │    │
│  │  ├── Controllers (Business Logic)                  │    │
│  │  ├── Socket.IO Server (Real-time Events)           │    │
│  │  └── Services (Background Tasks)                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Protocol
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA TIER                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  MongoDB Atlas (Cloud Database)                    │    │
│  │  ├── Users Collection                              │    │
│  │  ├── Rooms Collection                              │    │
│  │  └── Sessions Collection                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Communication Protocols

### HTTP/HTTPS Communication
Used for stateless operations including authentication, room management, and profile updates.

**Request Flow:**
```
Client → HTTP Request → Express Middleware → Route Handler → 
Controller → MongoDB → Response → Client
```

**Authentication Flow:**
```
Client                    Server                 MongoDB        Google
  │                         │                       │             │
  │──Google Sign In────────>│                       │             │
  │                         │──OAuth Request───────────────────>│
  │                         │<─OAuth Response──────────────────│
  │                         │──Query User──────>│             │
  │                         │<─User Data────────│             │
  │                         │──Generate JWT─────>│             │
  │<─JWT Token──────────────│                       │             │
  │                         │                       │             │
```

### WebSocket Communication (Socket.IO)
Used for real-time bidirectional communication including messaging, typing indicators, and presence tracking.

**Connection Flow:**
```
Client → WebSocket Handshake → JWT Verification → 
Socket Authentication → Event Listeners Active
```

**Message Flow:**
```
Client A                Server              Client B
   │                      │                    │
   │──send_message────>│                    │
   │                      │──Validate────────│
   │                      │──Sanitize─────────│
   │                      │──Rate Limit Check─│
   │                      │──new_message────>│
   │                      │                    │
```

## Application Layers

### 1. Presentation Layer (Client)

**Responsibility**: User interface rendering and user interaction handling.

**Components:**
- **Pages**: Route-level components (Login, Chat, RoomManager)
- **Components**: Reusable UI elements (Button, Input, ChatRoom)
- **Contexts**: Global state providers (AuthContext, SocketContext, ThemeContext)
- **Hooks**: Encapsulated business logic (useAuth, useSocket, useProfile)

**State Management Pattern:**
```
React Component
      │
      ├─> Context Provider (Global State)
      │         │
      │         ├─> Custom Hook (Business Logic)
      │         │         │
      │         │         └─> Service Layer (API/Socket)
      │         │
      │         └─> Local State (useState)
      │
      └─> Props (Component Tree)
```

### 2. Application Layer (Server)

**Responsibility**: Business logic execution, request processing, and real-time event handling.

**Structure:**
- **Middleware Stack**: Security, authentication, parsing
- **Routes**: Endpoint definitions
- **Controllers**: Request handling and response formatting
- **Socket Handlers**: Real-time event processing
- **Services**: Background tasks (room cleanup, keep-alive)

**Request Processing Pipeline:**
```
Incoming Request
      │
      ├─> Security Middleware (Helmet, XSS-Clean)
      │
      ├─> Rate Limiter
      │
      ├─> CORS Validation
      │
      ├─> Body Parser
      │
      ├─> Session/Cookie Handler
      │
      ├─> Authentication (JWT or Passport)
      │
      ├─> Route Handler
      │
      ├─> Controller Logic
      │
      ├─> Database Operation
      │
      └─> Response Formatter
```

### 3. Data Layer (MongoDB)

**Responsibility**: Data persistence and retrieval.

**Collections:**
- **users**: User accounts and profiles
- **rooms**: Chat room metadata
- **sessions**: Express session storage

**Access Pattern:**
```
Controller → Mongoose Model → MongoDB Driver → MongoDB Atlas
```

## Design Patterns

### 1. Repository Pattern
Mongoose models act as repositories abstracting database operations.

### 2. Middleware Pattern
Express middleware chain for request processing.

### 3. Provider Pattern
React Context API for dependency injection.

### 4. Observer Pattern
Socket.IO event emitters and listeners.

### 5. Factory Pattern
Room code generation and JWT token creation.

### 6. Singleton Pattern
Database connection and Socket.IO server instance.

## Data Flow Diagrams

### User Authentication Flow
```
┌──────┐     ┌────────┐     ┌──────────┐     ┌──────────┐
│Client│────>│ Google │────>│  Server  │────>│ MongoDB  │
└──────┘     │ OAuth  │     │          │     │          │
             └────────┘     │ Generate │     │ Store/   │
                ▲          │   JWT    │     │ Retrieve │
                │          └──────────┘     └──────────┘
                │                │
                └────────────────┘
                  Return Token
```

### Room Creation Flow
```
┌──────┐     ┌──────────┐     ┌──────────┐
│Client│────>│  Server  │────>│ MongoDB  │
│      │     │          │     │          │
│      │     │ Validate │     │ Create   │
│      │     │ Generate │     │ Room Doc │
│      │     │ Code/PIN │     │          │
│      │<────│          │<────│          │
└──────┘     └──────────┘     └──────────┘
  Room Code
```

### Real-Time Message Flow
```
┌─────────┐         ┌──────────────┐         ┌─────────┐
│Client A │────────>│ Socket.IO    │────────>│Client B │
│         │ Emit    │   Server     │ Broadcast│         │
│         │ Message │              │ to Room  │         │
│         │         │ ┌──────────┐ │         │         │
│         │         │ │ Validate │ │         │         │
│         │         │ │ Sanitize │ │         │         │
│         │         │ │Rate Limit│ │         │         │
│         │         │ └──────────┘ │         │         │
└─────────┘         └──────────────┘         └─────────┘
```

### Room Cleanup Flow
```
┌──────────────┐         ┌──────────┐         ┌──────────┐
│ Cleanup      │────────>│ MongoDB  │────────>│ Socket   │
│ Service      │ Query   │          │ Notify  │ Clients  │
│ (Cron Job)   │ Inactive│ Delete   │ Room    │          │
│              │ Rooms   │ Rooms    │ Closed  │          │
└──────────────┘         └──────────┘         └──────────┘
```

## Scalability Considerations

### Current Architecture
- Single server instance handling both HTTP and WebSocket
- Stateful socket connections tied to server instance
- MongoDB Atlas for horizontal scaling of database

### Scaling Limitations
1. **Socket.IO State**: Connections tied to single server
2. **In-Memory Messages**: Lost on server restart
3. **Session Store**: Centralized in MongoDB

### Potential Scaling Solutions
1. **Redis Adapter**: Enable multi-server Socket.IO deployment
2. **Load Balancer**: Sticky sessions for WebSocket connections
3. **Message Queue**: Decouple message processing
4. **Microservices**: Separate auth, chat, and room management

## Security Architecture

### Defense in Depth Layers

**Layer 1 - Network**
- HTTPS/WSS encryption
- CORS whitelist
- Helmet security headers

**Layer 2 - Application**
- Rate limiting
- Input validation
- XSS sanitization
- JWT authentication

**Layer 3 - Data**
- Password hashing (bcrypt)
- PIN hashing (bcrypt)
- No message persistence

## Performance Optimization

### Client-Side
- Code splitting with Vite
- Lazy loading of routes
- Memoization of expensive computations
- Debounced typing indicators

### Server-Side
- Connection pooling (MongoDB)
- Rate limiting prevents abuse
- Efficient socket event handlers
- Background cleanup services

### Network
- CDN for static assets (Vercel)
- Compressed responses
- WebSocket for reduced overhead
- HTTP/2 support
