import { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import { Message, OnlineUser } from '../types';

export const useSocket = () => {
  const { user } = useContext(AuthContext);
  const { setSocket, setOnlineUsers, setMessages, setTypingUsers } = useContext(SocketContext);
  const [socketInstance, setSocketInstance] = useState<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (user) {
      const socket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token: user.token },
      });

      socket.on('connect', () => {
        setSocket(socket);
        setSocketInstance(socket);
        socket.emit('join_room', 'general');
      });

      socket.on('users_online', (users: OnlineUser[]) => {
        setOnlineUsers(users);
      });

      socket.on('new_message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on('message_edited', (message: Message) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? message : m))
        );
      });

      socket.on('message_deleted', (data: { messageId: string }) => {
        setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
      });

      socket.on('user_typing', (data: { username: string; userId: string }) => {
        setTypingUsers((prev) => [...prev.filter((u) => u.userId !== data.userId), data]);
      });

      socket.on('user_stop_typing', (data: { userId: string }) => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });

      return () => {
        socket.disconnect();
        setSocketInstance(null);
        setSocket(null);
      };
    }
  }, [user, setSocket, setOnlineUsers, setMessages, setTypingUsers]);

  return socketInstance;
};