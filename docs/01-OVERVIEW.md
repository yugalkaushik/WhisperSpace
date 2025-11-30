# WhisperSpace - Project Overview

## What is WhisperSpace?

WhisperSpace is a privacy-focused, real-time chat application that enables users to create temporary chat rooms for secure, ephemeral conversations. The application emphasizes privacy by not storing chat messages in any database - all communications exist only in memory during active sessions. Once a room becomes inactive or users disconnect, all messages disappear permanently.

## Core Philosophy

The application is built on three fundamental principles:

1. **Privacy First**: No message persistence. Conversations are ephemeral and exist only during active sessions.
2. **Simplicity**: Clean, intuitive interface focused on core functionality without unnecessary complexity.
3. **Security**: Multiple layers of security including authentication, input validation, rate limiting, and XSS protection.

## Key Features

### User Authentication
- Google OAuth 2.0 integration for secure, passwordless authentication
- JWT-based token authentication for API requests
- Session management with MongoDB store
- User profile customization with avatars and usernames

### Room Management
- Create temporary chat rooms with custom names
- 4-digit PIN protection for room access
- 8-character unique room codes for easy sharing
- Automatic room cleanup when inactive
- Real-time member tracking

### Real-Time Messaging
- Instant message delivery using WebSocket technology (Socket.IO)
- Typing indicators to show when others are composing messages
- Online user presence tracking
- Room-based message isolation
- Emoji support

### Security Features
- Helmet.js for HTTP security headers
- XSS attack prevention through input sanitization
- Rate limiting on API endpoints and socket events
- CORS protection with whitelisted origins
- Content Security Policy implementation
- Message length validation
- SQL injection protection through MongoDB ODM

### Privacy Features
- Zero message persistence - no chat history stored
- Automatic room deletion after inactivity periods
- No tracking or analytics
- Ephemeral-only communication

## Technology Stack Summary

### Frontend Technologies
- **React 19.1.0**: Modern UI library with hooks and functional components
- **TypeScript 5.8.3**: Type-safe development
- **Vite 7.0.0**: Fast build tool and development server
- **Tailwind CSS 4.1.11**: Utility-first styling framework
- **Socket.IO Client 4.8.1**: Real-time WebSocket communication
- **React Router 7.6.3**: Client-side routing
- **Axios 1.10.0**: HTTP client for API requests
- **Lucide React**: Modern icon system
- **React Hot Toast**: Notification system

### Backend Technologies
- **Node.js 18+**: JavaScript runtime environment
- **Express 5.1.0**: Web application framework
- **TypeScript 5.8.3**: Type-safe server development
- **Socket.IO 4.8.1**: Real-time bidirectional communication
- **MongoDB 8.16.1**: NoSQL database via Mongoose ODM
- **Passport.js 0.7.0**: Authentication middleware
- **JWT (jsonwebtoken 9.0.2)**: Token-based authentication
- **Bcrypt.js 3.0.2**: Password and PIN hashing
- **Helmet 8.1.0**: Security headers middleware
- **Express Rate Limit 8.2.1**: Request rate limiting
- **XSS-Clean 0.1.4**: XSS sanitization

### Infrastructure
- **MongoDB Atlas**: Cloud database hosting
- **Render/Railway**: Backend hosting platform
- **Vercel**: Frontend hosting platform

## Architecture Pattern

WhisperSpace follows a client-server architecture with clear separation of concerns:

- **Presentation Layer**: React components with TypeScript
- **State Management**: React Context API for global state
- **Business Logic**: Custom hooks and service modules
- **API Layer**: RESTful endpoints and WebSocket events
- **Data Layer**: MongoDB with Mongoose ODM
- **Security Layer**: Multi-layered protection at each tier

## User Journey

1. **Authentication**: User signs in with Google OAuth
2. **Profile Setup**: User customizes username and avatar
3. **Room Selection**: User creates a new room or joins existing one
4. **Chat Interface**: Real-time messaging with room members
5. **Disconnect**: Room auto-deletes after inactivity, messages lost

## Project Goals

The project was designed to demonstrate:

- Full-stack TypeScript development
- Real-time communication implementation
- Security best practices
- Privacy-focused architecture
- Modern React patterns
- RESTful API design
- WebSocket protocol usage
- OAuth 2.0 integration
- Cloud deployment strategies
- Scalable application architecture

## Use Cases

WhisperSpace is ideal for:

- Temporary team discussions
- Private group conversations
- One-time collaborative sessions
- Anonymous feedback collection
- Confidential information sharing
- Quick brainstorming sessions
- Ephemeral customer support
