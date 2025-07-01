import { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../contexts/auth-context';
import { SocketContext } from '../contexts/socket-context';
import type { Message, OnlineUser } from '../types';

export const useSocket = (roomCode?: string) => {
  const { user, token } = useContext(AuthContext);
  const { setSocket, setOnlineUsers, setMessages, setTypingUsers, setCurrentRoom } = useContext(SocketContext);
  const [socketInstance, setSocketInstance] = useState<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (user && token) {
      // Parse token properly (same as API service)
      let parsedToken = token;
      if (typeof token === 'string') {
        try {
          parsedToken = JSON.parse(token);
        } catch {
          parsedToken = token;
        }
      }
      
      const socket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { 
          token: parsedToken,
          nickname: localStorage.getItem('user_nickname') || undefined,
          selectedAvatar: localStorage.getItem('user_avatar') || undefined,
        },
        transports: ["polling", "websocket"],
        withCredentials: true,
        upgrade: true,
        rememberUpgrade: false,
      });

      // Suppress connection error logs
      socket.on('connect_error', () => {
        // Silently handle connection errors to avoid console spam
        // The connection will automatically retry with polling
      });

      socket.on('connect', () => {
        setSocket?.(socket);
        setSocketInstance(socket);
        
        // Join the specific room if provided, otherwise join general
        const roomToJoin = roomCode || 'general';
        socket.emit('join_room', roomToJoin);
      });

      socket.on('users_online', (users: OnlineUser[]) => {
        setOnlineUsers?.(users);
      });

      socket.on('new_message', (message: Message) => {
        setMessages?.((prev) => [...prev, message]);
      });

      socket.on('message_edited', (message: Message) => {
        setMessages?.((prev) =>
          prev.map((m) => (m._id === message._id ? message : m))
        );
      });

      socket.on('message_deleted', (data: { messageId: string }) => {
        setMessages?.((prev) => prev.filter((m) => m._id !== data.messageId));
      });

      socket.on('user_typing', (data: { username: string; userId: string }) => {
        setTypingUsers?.((prev) => [...prev.filter((u) => u.userId !== data.userId), data]);
      });

      socket.on('user_stop_typing', (data: { userId: string }) => {
        setTypingUsers?.((prev) => prev.filter((u) => u.userId !== data.userId));
      });

      socket.on('joined_room', (room: string) => {
        console.log(`Joined room: ${room}`);
        // Clear messages when joining a new room
        setMessages?.([]);
      });

      socket.on('left_room', (room: string) => {
        console.log(`Left room: ${room}`);
        // Clear messages and current room when leaving
        setMessages?.([]);
        setCurrentRoom?.(null);
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });

      return () => {
        socket.disconnect();
        setSocketInstance(null);
        setSocket?.(null);
        setCurrentRoom?.(null);
      };
    }
  }, [user, token, roomCode, setSocket, setOnlineUsers, setMessages, setTypingUsers, setCurrentRoom]);

  return socketInstance;
};