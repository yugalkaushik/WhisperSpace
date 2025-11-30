import { useState, createContext } from 'react';
import type { ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import type { OnlineUser, Message, TypingUser, Room, SocketContextType } from '../types';
import { MESSAGE_TYPES } from '../utils/constants';

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

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const normalizeRoomCode = (code?: string) => code?.trim().toUpperCase() || undefined;

  const sendMessage = (content: string, room?: string, messageType: string = MESSAGE_TYPES.TEXT) => {
    const roomToUse = normalizeRoomCode(room || currentRoom?.code);
    if (roomToUse && socket) {
      socket.emit('send_message', { content, room: roomToUse, messageType });
    }
  };

  const joinRoom = (room: string) => {
    const normalized = normalizeRoomCode(room);
    if (normalized) {
      socket?.emit('join_room', normalized);
    }
  };

  const leaveRoom = (room: string) => {
    const normalized = normalizeRoomCode(room);
    if (!normalized) {
      return;
    }

    socket?.emit('leave_room', normalized);
    if (currentRoom?.code?.toUpperCase() === normalized) {
      setCurrentRoom(null);
    }
  };

  const startTyping = (room?: string) => {
    const roomToUse = normalizeRoomCode(room || currentRoom?.code);
    if (roomToUse && socket) {
      socket.emit('typing_start', { room: roomToUse });
    }
  };

  const stopTyping = (room?: string) => {
    const roomToUse = normalizeRoomCode(room || currentRoom?.code);
    if (roomToUse && socket) {
      socket.emit('typing_stop', { room: roomToUse });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
        messages,
        typingUsers,
        currentRoom,
        sendMessage,
        joinRoom,
        leaveRoom,
        startTyping,
        stopTyping,
        setSocket,
        setConnected,
        setOnlineUsers,
        setMessages,
        setTypingUsers,
        setCurrentRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};