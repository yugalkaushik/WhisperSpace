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
  const normalizedRoomCode = roomCode?.toUpperCase();

  useEffect(() => {
    console.log('🔌 useSocket effect triggered:', { user: !!user, token: !!token, roomCode: normalizedRoomCode });
    
    if (user && token && normalizedRoomCode) {
      console.log('🚀 Starting socket connection to:', SOCKET_URL);
      const socket = io(SOCKET_URL, {
        auth: { token },
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected successfully! Socket ID:', socket.id);
        console.log('🏠 Room code for joining:', normalizedRoomCode);
        setSocket?.(socket);
        setSocketInstance(socket);
        
        // Clear messages to start fresh (ephemeral messages only)
        setMessages?.([]);
        
        console.log('📥 Emitting join_room for:', normalizedRoomCode);
        socket.emit('join_room', normalizedRoomCode);
      });

      socket.on('users_online', (users: OnlineUser[]) => {
        console.log('👥 Received users_online:', users);
        setOnlineUsers?.(users);
      });

      socket.on('new_message', (message: Message) => {
        console.log('📨 Received new_message:', message);
        setMessages?.((prev) => [...prev, message]);
      });

      socket.on('user_typing', (data: { username: string; userId: string }) => {
        console.log('⌨️  User typing:', data);
        setTypingUsers?.((prev) => [...prev.filter((u) => u.userId !== data.userId), data]);
      });

      socket.on('user_stop_typing', (data: { userId: string }) => {
        console.log('⌨️  User stopped typing:', data);
        setTypingUsers?.((prev) => prev.filter((u) => u.userId !== data.userId));
      });

      socket.on('joined_room', (room) => {
        console.log('✅ Successfully joined room:', room);
        // Clear messages when joining a new room
        setMessages?.([]);
      });

      socket.on('left_room', () => {
        console.log('👋 Left room successfully');
        // Clear messages and current room when leaving
        setMessages?.([]);
        setCurrentRoom?.(null);
        
      });

      socket.on('error', (error: { message: string }) => {
        console.error('❌ Socket error:', error);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
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
        socket.off('error');
        socket.off('connect_error');
        socket.off('disconnect');
        socket.disconnect();
        setSocketInstance(null);
        setSocket?.(null);
        setCurrentRoom?.(null);
      };
    }
  }, [user, token, normalizedRoomCode, setSocket, setOnlineUsers, setMessages, setTypingUsers, setCurrentRoom]);

  return socketInstance;
};