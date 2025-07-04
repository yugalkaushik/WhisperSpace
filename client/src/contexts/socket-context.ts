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
  joinRoom: () => {},
  leaveRoom: () => {},
  startTyping: () => {},
  stopTyping: () => {},
});
