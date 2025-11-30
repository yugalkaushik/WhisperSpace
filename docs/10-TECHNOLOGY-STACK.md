# Technology Stack

## Overview

WhisperSpace is built using modern, production-ready technologies chosen for their reliability, performance, developer experience, and ecosystem support.

## Frontend Technologies

### React 19.1.0

**What it is**: JavaScript library for building user interfaces.

**Why we chose it**:
- Component-based architecture for reusability
- Virtual DOM for efficient rendering
- Huge ecosystem and community support
- Excellent developer tools
- Strong TypeScript integration
- Hooks API for cleaner code

**Where we use it**: Entire client-side application.

**Key Features Used**:
- Functional components
- Hooks (useState, useEffect, useContext, useCallback, useMemo)
- Context API for state management
- React Router for navigation
- Error boundaries (future implementation)

**Alternatives Considered**:
- Vue.js: Less ecosystem maturity
- Angular: Too heavy for this use case
- Svelte: Smaller ecosystem

---

### TypeScript 5.8.3

**What it is**: Statically typed superset of JavaScript.

**Why we chose it**:
- Catch errors at compile time
- Better IDE autocomplete and IntelliSense
- Self-documenting code through types
- Safer refactoring
- Enhanced maintainability

**Where we use it**: Both client and server codebases.

**Key Features Used**:
- Interface definitions
- Type inference
- Generic types
- Union and intersection types
- Type guards
- Strict mode

**Benefits Realized**:
- Fewer runtime errors
- Better code quality
- Easier collaboration
- Improved refactoring confidence

---

### Vite 7.0.0

**What it is**: Next-generation frontend build tool.

**Why we chose it**:
- Lightning-fast Hot Module Replacement (HMR)
- Optimized production builds
- Native ES modules in development
- Simple configuration
- Excellent TypeScript support
- Fast development server startup

**Where we use it**: Client build and development server.

**Alternatives Considered**:
- Create React App: Slower, deprecated
- Webpack: Complex configuration
- Parcel: Less plugin ecosystem

**Key Features Used**:
- Development server with HMR
- Production build optimization
- Code splitting
- Asset handling
- Environment variables (VITE_ prefix)

---

### Tailwind CSS 4.1.11

**What it is**: Utility-first CSS framework.

**Why we chose it**:
- Rapid UI development
- Consistent design system
- No CSS file switching
- Responsive design utilities
- Dark mode support
- Smaller bundle size (tree-shaking)

**Where we use it**: All component styling.

**Alternatives Considered**:
- Styled Components: Runtime overhead
- CSS Modules: More boilerplate
- Bootstrap: Less flexible

**Key Features Used**:
- Utility classes
- Responsive prefixes (sm:, md:, lg:)
- Custom configuration
- JIT (Just-In-Time) mode
- Component extraction

---

### Socket.IO Client 4.8.1

**What it is**: Real-time bidirectional communication library.

**Why we chose it**:
- Automatic reconnection
- Room support
- Event-based communication
- Fallback to polling
- Browser compatibility
- Perfect match with Socket.IO server

**Where we use it**: Real-time chat features.

**Alternatives Considered**:
- Raw WebSockets: No reconnection, no rooms
- Server-Sent Events (SSE): Unidirectional only
- Long polling: Inefficient

**Key Features Used**:
- Connection management
- Event emitters and listeners
- Room-based messaging
- Authentication in handshake
- Error handling

---

### React Router 7.6.3

**What it is**: Declarative routing for React applications.

**Why we chose it**:
- De facto standard for React routing
- Declarative route configuration
- Nested routes support
- Route protection
- Navigation hooks

**Where we use it**: Client-side routing and navigation.

**Key Features Used**:
- Route definitions
- Protected routes
- Navigation with useNavigate
- URL parameters
- Query parameters

---

### Axios 1.10.0

**What it is**: Promise-based HTTP client.

**Why we chose it**:
- Request/response interceptors
- Automatic JSON transformation
- Request cancellation
- Better error handling than fetch
- TypeScript support

**Where we use it**: REST API communication.

**Alternatives Considered**:
- Fetch API: Less features, more boilerplate
- XMLHttpRequest: Outdated API

**Key Features Used**:
- Request interceptors (add auth token)
- Response interceptors (handle errors)
- Base URL configuration
- TypeScript types

---

### Additional Frontend Libraries

**Lucide React 0.525.0**
- Modern icon set
- Tree-shakeable
- Consistent design
- Easy to use

**React Hot Toast 2.5.2**
- User notifications
- Customizable
- Accessible
- Promise-based

**Emoji Picker React 4.12.3**
- Emoji selection UI
- Search functionality
- Category organization
- Cross-platform compatibility

**Headless UI 2.2.4**
- Unstyled, accessible components
- Perfect for custom styling
- WAI-ARIA compliant
- Tailwind integration

---

## Backend Technologies

### Node.js 18+

**What it is**: JavaScript runtime built on Chrome's V8 engine.

**Why we chose it**:
- Single language for full stack
- Non-blocking I/O for real-time apps
- Large package ecosystem (npm)
- Excellent for WebSocket applications
- Active community

**Where we use it**: Entire backend runtime.

**Key Features Used**:
- Event-driven architecture
- Async/await
- Module system (CommonJS)
- Process management

---

### Express 5.1.0

**What it is**: Minimal and flexible Node.js web framework.

**Why we chose it**:
- Industry standard
- Middleware architecture
- Minimal overhead
- Extensive ecosystem
- Easy to learn

**Where we use it**: HTTP server and API routing.

**Alternatives Considered**:
- Fastify: Less ecosystem maturity
- Koa: Less middleware availability
- NestJS: Too heavy for this project

**Key Features Used**:
- Routing
- Middleware stack
- Request/response handling
- Static file serving
- Session management

---

### Socket.IO 4.8.1

**What it is**: Real-time bidirectional event-based communication library.

**Why we chose it**:
- Perfect for chat applications
- Room-based broadcasting
- Automatic reconnection
- Fallback mechanisms
- Matches client library

**Where we use it**: WebSocket server for real-time features.

**Key Features Used**:
- Connection authentication
- Room management
- Event broadcasting
- Middleware support
- Error handling

---

### MongoDB (Mongoose 8.16.1)

**What it is**: NoSQL document database with ODM (Object Document Mapper).

**Why we chose it**:
- Flexible schema for rapid development
- Horizontal scaling capabilities
- JSON-like documents
- Rich query language
- Cloud hosting (Atlas)
- Excellent Node.js support

**Where we use it**: Primary data storage.

**Alternatives Considered**:
- PostgreSQL: More rigid schema
- MySQL: Relational model overhead
- Redis: No complex queries

**Key Features Used**:
- Schema definitions
- Validation
- Middleware (hooks)
- Indexing
- Aggregation pipelines
- Cloud hosting (Atlas)

**Mongoose Benefits**:
- Schema enforcement in schemaless database
- Validation at application level
- Middleware hooks (pre/post save)
- Type casting
- Query builder

---

### Passport.js 0.7.0

**What it is**: Authentication middleware for Node.js.

**Why we chose it**:
- Strategy-based authentication
- OAuth 2.0 support (Google)
- Session management
- Well-documented
- Industry standard

**Where we use it**: OAuth authentication flow.

**Key Features Used**:
- Google OAuth strategy
- Session serialization/deserialization
- Authentication middleware

---

### JSON Web Tokens (jsonwebtoken 9.0.2)

**What it is**: Compact, URL-safe token format for claims transfer.

**Why we chose it**:
- Stateless authentication
- Self-contained (no server storage)
- Industry standard (RFC 7519)
- Cross-platform support
- Scalable

**Where we use it**: User authentication and API authorization.

**Alternatives Considered**:
- Session cookies: Stateful, harder to scale
- OAuth tokens: Overkill for our use case

**Key Features Used**:
- Token signing
- Token verification
- Expiration handling
- Payload embedding

---

### Bcrypt.js 3.0.2

**What it is**: Password hashing library.

**Why we chose it**:
- Industry-standard hashing algorithm
- Salting built-in
- Configurable cost factor
- Resistant to brute force
- Slow by design (security feature)

**Where we use it**: Password and PIN hashing.

**Key Features Used**:
- Password hashing
- Hash comparison
- Salt generation
- Cost factor configuration (10-12 rounds)

---

### Security Middleware

**Helmet 8.1.0**
- Security headers
- XSS protection
- Clickjacking prevention
- MIME sniffing protection

**Express Rate Limit 8.2.1**
- Request rate limiting
- DoS protection
- Configurable windows
- IP-based tracking

**XSS-Clean 0.1.4**
- Input sanitization
- XSS attack prevention
- Request body cleaning

**CORS 2.8.5**
- Cross-Origin Resource Sharing
- Origin whitelisting
- Credential support

---

### Additional Backend Libraries

**connect-mongo 5.1.0**
- MongoDB session store
- Passport session persistence

**cookie-parser 1.4.7**
- Cookie parsing middleware
- Session cookie handling

**express-session 1.18.1**
- Session management
- Cookie-based sessions

**express-validator 7.3.1**
- Input validation
- Sanitization
- Error formatting

**dotenv 17.0.0**
- Environment variable management
- Configuration loading

---

## Development Tools

### TypeScript Compiler

**Purpose**: Compile TypeScript to JavaScript

**Configuration**: tsconfig.json in both client and server

---

### ESLint

**Purpose**: JavaScript/TypeScript linting

**Configuration**: eslint.config.js

**Benefits**:
- Code quality enforcement
- Consistent style
- Error prevention

---

### Nodemon 3.1.10

**Purpose**: Auto-restart server on file changes

**Benefits**:
- Faster development
- No manual restart needed

---

## Infrastructure

### Vercel

**What it is**: Frontend hosting and deployment platform.

**Why we chose it**:
- Optimized for React/Vite
- Global CDN
- Automatic deployments
- HTTPS by default
- Zero configuration
- Excellent performance
- Free tier generous

**What it provides**:
- Static site hosting
- Continuous deployment
- Preview deployments
- Custom domains
- Analytics

---

### Render / Railway

**What it is**: Backend hosting platform.

**Why we chose it**:
- Free tier available
- Automatic deployments
- HTTPS included
- Environment variables
- Logs and monitoring
- Easy PostgreSQL/MongoDB integration

**Alternatives Considered**:
- Heroku: Removed free tier
- AWS EC2: Complex setup
- DigitalOcean: More management required

**What it provides**:
- Node.js runtime
- WebSocket support
- Automatic restarts
- Health checks
- Environment configuration

---

### MongoDB Atlas

**What it is**: Cloud-hosted MongoDB database.

**Why we chose it**:
- Fully managed
- Free tier (512MB)
- Automatic backups
- Scalability
- Security features
- Global distribution

**What it provides**:
- Database hosting
- Automatic backups
- Monitoring
- Alerts
- Network security

---

## Design Decisions

### Why Single-Page Application (SPA)?

**Chosen**: React SPA

**Reasons**:
- Better user experience (no page reloads)
- Faster navigation
- Real-time updates easier to implement
- Rich interactive features
- API-first architecture

**Trade-offs**:
- Initial load time
- SEO (not critical for this app)
- JavaScript required

---

### Why REST + WebSocket (Not GraphQL)?

**Chosen**: REST APIs + Socket.IO

**Reasons**:
- Simpler to implement
- Better for real-time (WebSockets)
- Less overhead
- Easier to debug
- RESTful design well-understood

**Trade-offs**:
- Multiple endpoints vs single GraphQL endpoint
- Potential over-fetching
- No built-in schema introspection

---

### Why NoSQL (MongoDB) vs SQL?

**Chosen**: MongoDB

**Reasons**:
- Flexible schema for rapid development
- JSON-like documents match JavaScript objects
- Easy to scale horizontally
- No complex relationships in our data
- Fast iteration on data structure

**Trade-offs**:
- No ACID transactions (though MongoDB now supports)
- Schema flexibility can lead to inconsistency
- Need application-level validation

---

### Why JWT vs Session Cookies?

**Chosen**: JWT tokens

**Reasons**:
- Stateless (easier to scale)
- Works across domains
- Mobile app ready
- Microservices friendly
- Reduced database queries

**Trade-offs**:
- Can't invalidate before expiration
- Larger than session IDs
- Payload exposed (base64, not encrypted)

---

### Why TypeScript vs JavaScript?

**Chosen**: TypeScript

**Reasons**:
- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Easier refactoring
- Growing industry adoption

**Trade-offs**:
- Compilation step
- Learning curve
- More initial setup

---

## Technology Stack Summary

**Frontend Stack**:
```
React + TypeScript + Vite
├── UI: Tailwind CSS + Headless UI
├── State: React Context API
├── Routing: React Router
├── HTTP: Axios
├── WebSocket: Socket.IO Client
└── Build: Vite

Hosted on: Vercel
```

**Backend Stack**:
```
Node.js + Express + TypeScript
├── Database: MongoDB + Mongoose
├── Auth: Passport.js + JWT
├── Security: Helmet + Rate Limiting + XSS-Clean
├── WebSocket: Socket.IO Server
└── Build: TypeScript Compiler

Hosted on: Render/Railway
```

**Database**:
```
MongoDB Atlas (Cloud)
├── Collections: users, rooms, sessions
└── Features: Backups, Monitoring, Security
```

## Version Compatibility

**Node.js**: >= 18.0.0
**NPM**: >= 9.0.0
**MongoDB**: >= 5.0
**Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)
