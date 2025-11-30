# Client Architecture

## Directory Structure

```
client/
├── public/                     # Static assets
├── src/
│   ├── assets/                # Images, fonts, static files
│   ├── components/            # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   ├── chat/             # Chat-related components
│   │   ├── profile/          # User profile components
│   │   ├── room/             # Room management components
│   │   └── ui/               # Generic UI components
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Route-level components
│   ├── services/             # API and Socket services
│   ├── styles/               # Global styles
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions and constants
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── vercel.json               # Vercel deployment config
```

## Core Concepts

### 1. Component Architecture

#### Component Hierarchy

```
App (Root)
├── ThemeProvider
│   └── AuthProvider
│       └── SocketProvider
│           └── Router
│               ├── Login Page
│               ├── Profile Setup Page
│               ├── Room Manager Page
│               ├── Transition Screen
│               ├── Chat Page
│               └── Auth Callback Page
```

#### Component Categories

**Presentation Components** (components/ui/)
- Pure, stateless components
- Receive data via props
- No business logic
- Examples: Button, Input, Avatar, Modal

**Container Components** (pages/)
- Route-level components
- Connect to contexts
- Manage local state
- Coordinate child components
- Examples: Chat, Login, RoomManagerPage

**Feature Components** (components/auth, components/chat, etc.)
- Domain-specific functionality
- May connect to contexts
- Handle specific features
- Examples: ChatRoom, MessageList, UserProfileDropdown

### 2. State Management

WhisperSpace uses React Context API for global state management with three primary contexts:

#### AuthContext

**Purpose**: Manage user authentication state and operations.

**State:**
```typescript
{
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

**Methods:**
- `login()`: Initiate Google OAuth
- `logout()`: Clear authentication state
- `setAuthData()`: Set user and token after authentication

**Storage**: LocalStorage for persistence across sessions

#### SocketContext

**Purpose**: Manage WebSocket connection and real-time state.

**State:**
```typescript
{
  socket: Socket | null;
  connected: boolean;
  onlineUsers: OnlineUser[];
  messages: Message[];
  typingUsers: TypingUser[];
  currentRoom: Room | null;
}
```

**Methods:**
- `sendMessage()`: Emit message to server
- `joinRoom()`: Join a chat room
- `leaveRoom()`: Leave current room
- `startTyping()`: Emit typing indicator
- `stopTyping()`: Clear typing indicator

**Lifecycle**: Connected when authenticated, disconnected on logout

#### ThemeContext

**Purpose**: Manage application theme (dark/light mode).

**State:**
```typescript
{
  theme: 'light' | 'dark';
}
```

**Methods:**
- `toggleTheme()`: Switch between themes

**Storage**: LocalStorage for theme preference

### 3. Custom Hooks

#### useAuth

**Location**: `hooks/useAuth.ts`

**Purpose**: Encapsulate authentication logic and state management.

**Features:**
- Token validation and refresh
- User profile rehydration
- Automatic logout on token expiration
- LocalStorage synchronization

**Usage:**
```typescript
const { user, token, loading, logout } = useAuth();
```

#### useSocket

**Location**: `hooks/useSocket.ts`

**Purpose**: Manage Socket.IO connection lifecycle.

**Features:**
- Auto-connect on authentication
- Auto-disconnect on logout
- Event listener registration
- Error handling and reconnection

**Socket Events Handled:**
- `connect`: Connection established
- `disconnect`: Connection lost
- `new_message`: Incoming message
- `users_online`: Updated user list
- `user_typing`: Typing indicator
- `joined_room`: Room join confirmation

#### useProfile

**Location**: `hooks/useProfile.ts`

**Purpose**: Manage user profile state and updates.

**Features:**
- Profile data caching
- Avatar management
- Username updates
- API integration

#### useLocalStorage

**Location**: `hooks/useLocalStorage.ts`

**Purpose**: Synchronized state with localStorage.

**Features:**
- Type-safe storage operations
- Automatic serialization/deserialization
- React state synchronization

#### useKeepAlive

**Location**: `hooks/useKeepAlive.ts`

**Purpose**: Prevent server sleep on free-tier hosting.

**Features:**
- Periodic health check pings
- Configurable interval
- Automatic on mount

### 4. Service Layer

#### API Service (`services/api.ts`)

**Purpose**: Centralized HTTP API communication.

**Configuration:**
```typescript
- Base URL: Environment variable or production default
- Headers: Automatic JWT token injection
- Interceptors: Request/response transformations
```

**Endpoints:**
- `verifyToken()`: Validate JWT and fetch user profile
- `createRoom()`: Create new chat room
- `joinRoom()`: Join existing room
- `getRoomInfo()`: Get room details
- `leaveRoom()`: Leave current room

#### Socket Service (`services/socket.ts`)

**Purpose**: Socket.IO client initialization.

**Configuration:**
```typescript
- URL: Environment variable or production default
- Auth: JWT token in handshake
- Transports: WebSocket with polling fallback
```

### 5. Routing Structure

#### Route Configuration

```typescript
/ (or /login)           → Login Page
/profile-setup          → Profile Setup Page (Protected)
/rooms                  → Room Manager Page (Protected)
/transition             → Transition Screen (Protected)
/chat                   → Chat Page (Protected)
/auth/callback          → OAuth Callback Handler
```

#### Route Protection

**ProtectedRoute Component** (`components/auth/ProtectedRoute.tsx`)

**Features:**
- Check authentication status
- Verify profile completion
- Redirect unauthenticated users
- Redirect incomplete profiles

**Logic:**
```typescript
if (!user) → Redirect to /login
if (requireProfileSetup && !user.username) → Redirect to /profile-setup
else → Render children
```

### 6. Type System

#### Core Types (`types/index.ts`)

**User Type:**
```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}
```

**Message Type:**
```typescript
interface Message {
  _id: string;
  content: string;
  sender: User;
  room: string;
  messageType: 'text' | 'emoji' | 'image';
  createdAt: Date;
  isEdited: boolean;
}
```

**Room Type:**
```typescript
interface Room {
  _id: string;
  name: string;
  code: string;
  creator: string;
  members: string[];
  isActive: boolean;
}
```

**OnlineUser Type:**
```typescript
interface OnlineUser {
  socketId: string;
  username: string;
  userId: string;
  rooms: Set<string>;
}
```

### 7. Component Details

#### Pages

**Login (`pages/Login.tsx`)**
- Google OAuth button
- Redirect authenticated users
- Error handling for failed authentication
- Clean, minimal interface

**ProfileSetup (`pages/ProfileSetup.tsx`)**
- Username selection
- Avatar customization
- Form validation
- API integration for profile updates

**RoomManagerPage (`pages/RoomManagerPage.tsx`)**
- Create room form
- Join room form
- Input validation
- Navigation to chat

**Chat (`pages/Chat.tsx`)**
- Main chat interface
- Integrates ChatRoom component
- Socket connection management
- Online user list
- Message input/display

**TransitionScreen (`pages/TransitionScreen.tsx`)**
- Loading state between routes
- Animation during navigation

**AuthCallback (`pages/AuthCallback.tsx`)**
- Handle OAuth redirect
- Extract token from URL
- Fetch user profile
- Redirect to appropriate page

#### Chat Components

**ChatRoom (`components/chat/ChatRoom.tsx`)**
- Room header with name/code
- Message list integration
- Message input integration
- User list sidebar
- Leave room functionality

**MessageList (`components/chat/MessageList.tsx`)**
- Display messages in chronological order
- Auto-scroll to bottom
- Message grouping by sender
- Timestamp formatting
- Empty state handling

**MessageInput (`components/chat/MessageInput.tsx`)**
- Text input with validation
- Emoji picker integration
- Send button with keyboard shortcut
- Character limit indicator
- Typing indicator emission

**TypingIndicator (`components/chat/TypingIndicator.tsx`)**
- Display typing users
- Animated dots
- Auto-hide after timeout

**UserList (`components/chat/UserList.tsx`)**
- Display online users
- Real-time presence updates
- User count display
- Online status indicators

#### UI Components

**Button (`components/ui/Button.tsx`)**
- Reusable button with variants
- Loading state support
- Disabled state handling
- Icon support

**Input (`components/ui/Input.tsx`)**
- Controlled input component
- Error state display
- Label support
- Various input types

**Modal (`components/ui/Modal.tsx`)**
- Overlay modal dialog
- Portal-based rendering
- Close on outside click
- Keyboard navigation

**Avatar (`components/ui/Avatar.tsx`)**
- User avatar display
- Fallback to initials
- Online status indicator
- Size variants

### 8. Utility Functions

#### Constants (`utils/constants.ts`)

**API Configuration:**
```typescript
API_BASE_URL: Backend API endpoint
SOCKET_URL: WebSocket server endpoint
```

**Storage Keys:**
```typescript
TOKEN: JWT token key
USER: User data key
THEME: Theme preference key
```

**Message Constants:**
```typescript
MAX_MESSAGE_LENGTH: 1000 characters
TYPING_TIMEOUT: 1 second
MESSAGE_LIMIT: 50 messages per request
```

#### Formatters (`utils/formatters.ts`)

**Functions:**
- `formatDate()`: Convert timestamp to readable format
- `formatTime()`: Extract time from timestamp
- `truncateText()`: Limit text length with ellipsis

#### Avatars (`utils/avatars.ts`)

**Functions:**
- `getAvatarColor()`: Generate color based on username
- `getInitials()`: Extract initials from name

### 9. Build Configuration

#### Vite Configuration (`vite.config.ts`)

**Plugins:**
- `@vitejs/plugin-react`: React support with Fast Refresh
- `@tailwindcss/vite`: Tailwind CSS integration

**Optimizations:**
- Code splitting by vendor libraries
- Manual chunk configuration
- Tree shaking for unused code
- Asset inlining for small files

**Development Server:**
- Port 5173
- Hot Module Replacement (HMR)
- Proxy API requests to backend during development

**Build Output:**
- Minified JavaScript and CSS
- Source maps for debugging
- Optimized asset delivery
- Chunk size warnings at 600KB

#### TypeScript Configuration

**Compiler Options:**
- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Strict mode enabled
- Path aliases: `@/*` → `src/*`

### 10. Performance Optimization

**Code Splitting:**
- Route-based lazy loading
- Vendor chunk separation
- Dynamic imports for heavy components

**Memoization:**
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers

**Network Optimization:**
- Debounced API calls
- Request deduplication
- Cached responses

**Rendering Optimization:**
- Virtual scrolling for long lists
- Conditional rendering
- Avoid unnecessary re-renders

### 11. Error Handling

**API Errors:**
- Axios interceptors catch network errors
- Toast notifications for user feedback
- Automatic retry on certain failures

**Socket Errors:**
- Connection failure handling
- Reconnection logic
- Error event listeners

**Component Errors:**
- Error boundaries (future implementation)
- Graceful degradation
- User-friendly error messages
