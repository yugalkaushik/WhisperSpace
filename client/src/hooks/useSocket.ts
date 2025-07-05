import { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../contexts/auth-context';
import { SocketContext } from '../contexts/socket-context';
import { SOCKET_URL } from '../utils/constants';
import type { Message, OnlineUser } from '../types';

export const useSocket = (roomCode?: string) => {
  const { user, token } = useContext(AuthContext);
  const { setSocket, setOnlineUsers, setMessages, setTypingUsers, setCurrentRoom } = useContext(SocketContext);
  const [socketInstance, setSocketInstance] = useState<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (user && token) {
      const socket = io(SOCKET_URL, {
        auth: { token },
      });

      socket.on('connect', () => {
        setSocket?.(socket);
        setSocketInstance(socket);
        
        // Clear messages to start fresh (ephemeral messages only)
        setMessages?.([]);
        
        // Only join the specific room if provided
        if (roomCode) {
          socket.emit('join_room', roomCode);
        }
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
        // Joined room
        // Clear messages when joining a new room
        setMessages?.([]);
      });

      socket.on('left_room', () => {
        // Clear messages and current room when leaving
        setMessages?.([]);
        setCurrentRoom?.(null);
        
        // Clear room data from localStorage
        localStorage.removeItem('currentRoom');
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });

      return () => {
        // Cleanup socket connection
        socket.off('connect');
        socket.off('users_online');
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.off('left_room');
        socket.off('error');
        socket.disconnect();
        setSocketInstance(null);
        setSocket?.(null);
        setCurrentRoom?.(null);
        // Clean up localStorage
        localStorage.removeItem('currentRoom');
      };
    }
  }, [user, token, roomCode, setSocket, setOnlineUsers, setMessages, setTypingUsers, setCurrentRoom]);

  return socketInstance;
};