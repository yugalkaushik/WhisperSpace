import { createContext } from 'react';
import type { SocketContextType } from '../types';

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  onlineUsers: [],
  messages: [],
  typingUsers: [],
  currentRoom: null,
  sendMessage: () => {},
  editMessage: () => {},
  deleteMessage: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  startTyping: () => {},
  stopTyping: () => {},
});
