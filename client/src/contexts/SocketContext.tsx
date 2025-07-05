import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import type { OnlineUser, Message, TypingUser, Room } from '../types';
import { SocketContext } from './socket-context';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const sendMessage = (content: string, room?: string) => {
    const roomToUse = room || currentRoom?.code;
    if (roomToUse) {
      socket?.emit('send_message', { content, room: roomToUse });
    }
  };

  // Removed edit and delete message functions (messages are now ephemeral)

  const joinRoom = (room: string) => {
    socket?.emit('join_room', room);
  };

  const leaveRoom = (room: string) => {
    // Emitting leave_room event
    socket?.emit('leave_room', room);
    // Clear current room if it's the one being left
    if (currentRoom?.code === room) {
      setCurrentRoom(null);
    }
  };

  const startTyping = (room?: string) => {
    const roomToUse = room || currentRoom?.code;
    if (roomToUse) {
      socket?.emit('typing_start', { room: roomToUse });
    }
  };

  const stopTyping = (room?: string) => {
    const roomToUse = room || currentRoom?.code;
    if (roomToUse) {
      socket?.emit('typing_stop', { room: roomToUse });
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