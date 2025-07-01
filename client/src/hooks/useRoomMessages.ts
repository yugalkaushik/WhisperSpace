import { useEffect, useContext } from 'react';
import { SocketContext } from '../contexts/socket-context';
import api from '../services/api';
import type { MessagesResponse } from '../types';

export const useRoomMessages = (roomCode?: string) => {
  const { setMessages } = useContext(SocketContext);

  useEffect(() => {
    if (!roomCode) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get<MessagesResponse>(`/messages?room=${roomCode}&limit=50`);
        setMessages?.(response.data.messages);
      } catch (error) {
        console.error('Failed to fetch room messages:', error);
        setMessages?.([]);
      }
    };

    fetchMessages();
  }, [roomCode, setMessages]);
};
