import { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import { SOCKET_URL } from '../utils/constants';
import type { Message, OnlineUser } from '../types';

export const useSocket = (roomCode?: string) => {
  const { user, token } = useContext(AuthContext);
  const { setSocket, setOnlineUsers, setMessages, setTypingUsers, setCurrentRoom } = useContext(SocketContext);
  const [socketInstance, setSocketInstance] = useState<ReturnType<typeof io> | null>(null);
  const normalizedRoomCode = roomCode?.toUpperCase();

  useEffect(() => {
    if (user && token && normalizedRoomCode) {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      socket.on('connect', () => {
        setSocket?.(socket);
        setSocketInstance(socket);
        
        // Clear messages to start fresh (ephemeral messages only)
        setMessages?.([]);
        
        // Wait a brief moment to ensure socket is fully ready before joining
        setTimeout(() => {
          socket.emit('join_room', normalizedRoomCode);
        }, 100);
      });

      socket.on('users_online', (users: OnlineUser[]) => {
        setOnlineUsers?.(users);
      });

      socket.on('new_message', (message: Message) => {
        setMessages?.((prev) => [...prev, message]);
      });

      socket.on('user_typing', (data: { username: string; userId: string }) => {
        setTypingUsers?.((prev) => [...prev.filter((u) => u.userId !== data.userId), data]);
      });

      socket.on('user_stop_typing', (data: { userId: string }) => {
        setTypingUsers?.((prev) => prev.filter((u) => u.userId !== data.userId));
      });

      socket.on('joined_room', () => {
        // Clear messages when joining a new room
        setMessages?.([]);
      });

      socket.on('left_room', () => {
        // Clear messages and current room when leaving
        setMessages?.([]);
        setCurrentRoom?.(null);
      });

      return () => {
        // Cleanup socket connection
        socket.off('connect');
        socket.off('users_online');
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.off('joined_room');
        socket.off('left_room');
        socket.disconnect();
        setSocketInstance(null);
        setSocket?.(null);
        setCurrentRoom?.(null);
      };
    }
  }, [user, token, normalizedRoomCode, setSocket, setOnlineUsers, setMessages, setTypingUsers, setCurrentRoom]);

  return socketInstance;
};