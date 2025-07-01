export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  googleId?: string;
  isOnline: boolean;
  lastSeen: Date;
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

export interface MessageResponse {
  message: string;
  data: Message;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface TypingUser {
  username: string;
  userId: string;
}