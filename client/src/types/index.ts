import type { Socket } from 'socket.io-client';

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  googleId?: string;
  isEmailVerified?: boolean;
  isOnline: boolean;
  lastSeen: Date;
  token?: string; // For client-side auth state
}

export interface UserProfile {
  nickname: string; // Display name chosen by user (stored in localStorage)
  selectedAvatar: string; // Avatar ID chosen by user (stored in localStorage)
}

export interface Room {
  _id: string;
  name: string;
  code: string;
  pin: string;
  members: User[];
  createdBy: User;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  receiver?: string;
  room: string;
  messageType: 'text' | 'emoji' | 'image';
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnlineUser {
  socketId: string;
  username: string;
  userId: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface TypingUser {
  username: string;
  userId: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  loading: boolean;
  setAuthData: (userData: User, authToken: string) => void;
}

export interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: OnlineUser[];
  messages: Message[];
  typingUsers: TypingUser[];
  currentRoom: Room | null;
  sendMessage: (content: string, room?: string, messageType?: string) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  startTyping: (room?: string) => void;
  stopTyping: (room?: string) => void;
  setSocket?: (socket: Socket | null) => void;
  setConnected?: (connected: boolean) => void;
  setOnlineUsers?: (users: OnlineUser[]) => void;
  setMessages?: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setTypingUsers?: (users: TypingUser[] | ((prev: TypingUser[]) => TypingUser[])) => void;
  setCurrentRoom?: (room: Room | null) => void;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}