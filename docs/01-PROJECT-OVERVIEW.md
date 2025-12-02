# WhisperSpace - Project Overview

## What is WhisperSpace?

A real-time chat application where users can create temporary chat rooms for ephemeral conversations. Messages are never stored in the database - they exist only in memory during active sessions, ensuring complete privacy.

## Key Features

### Authentication
- Email/OTP authentication
- Google OAuth 2.0 integration
- JWT-based session management
- User profile customization (username, avatar)

### Chat Rooms
- Create temporary rooms with custom names
- 4-digit PIN protection for room access
- 8-character unique room codes for sharing
- Automatic cleanup when rooms become inactive
- Real-time member tracking

### Real-Time Communication
- Instant messaging using Socket.IO (WebSocket)
- Typing indicators
- Online presence tracking
- Room-based message isolation

### Security & Privacy
- Zero message persistence - all chats are ephemeral
- XSS protection with input sanitization
- Rate limiting on API and socket events
- CORS protection
- Helmet.js security headers
- Bcrypt password hashing

## Architecture

### High-Level Structure
```
Client (React + Vite) 
    ↕ HTTPS/WSS
Server (Node.js + Express + Socket.IO)
    ↕ MongoDB Protocol
Database (MongoDB Atlas)
```

### Communication Patterns

**HTTP/REST API** - Authentication, room management, profile updates

**WebSocket (Socket.IO)** - Real-time messaging, typing indicators, presence

### Client Architecture
- **React 19** with TypeScript
- **Context API** for state management (AuthContext, SocketContext, ThemeContext)
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Vite** for fast development and builds

### Server Architecture
- **Express.js** web framework
- **Socket.IO** for WebSocket communication
- **Passport.js** for OAuth
- **JWT** for token authentication
- **Mongoose** ODM for MongoDB
- Background services for room cleanup and keep-alive

### Database Design
MongoDB with 3 collections:
- **users** - User accounts and profiles
- **rooms** - Room metadata and members
- **sessions** - Express session store

## Technology Stack

### Frontend
- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.0
- Tailwind CSS 4.1.11
- Socket.IO Client 4.8.1
- React Router 7.6.3
- Axios 1.10.0

### Backend
- Node.js 18+
- Express 5.1.0
- TypeScript 5.8.3
- Socket.IO 4.8.1
- MongoDB 8.16.1 with Mongoose
- Passport.js 0.7.0
- JWT (jsonwebtoken 9.0.2)
- Bcrypt.js 3.0.2
- Helmet 8.1.0
- Express Rate Limit 8.2.1

### Deployment
- Frontend: Vercel
- Backend: Render/Railway
- Database: MongoDB Atlas

## User Flow

1. User authenticates (Email/OTP or Google OAuth)
2. User sets up profile (username, avatar)
3. User creates a new room or joins existing one with room code and PIN
4. Real-time chat with room members
5. User leaves or disconnects - room auto-deletes after inactivity
6. All messages are lost (ephemeral design)

## Project Structure

```
WhisperSpace/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Route components
│   │   ├── services/      # API/Socket services
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/          # Node.js backend
│   ├── src/
│   │   ├── config/        # Database, Passport config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Background services
│   │   └── server.ts      # Entry point
│   └── package.json
└── docs/            # Documentation
```

## Why These Technologies?

**React** - Component-based UI, huge ecosystem, excellent TypeScript support

**TypeScript** - Type safety, fewer runtime errors, better developer experience

**Socket.IO** - Reliable WebSocket library with fallbacks, easy event-based API

**MongoDB** - Flexible schema, excellent with Node.js, easy to scale

**Express** - Minimal, flexible web framework with extensive middleware ecosystem

**Vite** - Lightning-fast HMR, optimized builds, simple configuration

**Tailwind CSS** - Rapid UI development, consistent design system
