import { createContext, ReactNode, useState } from 'react';
import { SocketContextType } from '../types';

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  onlineUsers: [],
  messages: [],
  typingUsers: [],
  sendMessage: () => {},
  editMessage: () => {},
  deleteMessage: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  startTyping: () => {},
  stopTyping: () => {},
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const sendMessage = (content: string, room: string = 'general') => {
    socket?.emit('send_message', { content, room });
  };

  const editMessage = (messageId: string, content: string, room: string = 'general') => {
    socket?.emit('edit_message', { messageId, content, room });
  };

  const deleteMessage = (messageId: string, room: string = 'general') => {
    socket?.emit('delete_message', { messageId, room });
  };

  const joinRoom = (room: string) => {
    socket?.emit('join_room', room);
  };

  const leaveRoom = (room: string) => {
    socket?.emit('leave_room', room);
  };

  const startTyping = (room: string = 'general') => {
    socket?.emit('typing_start', { room });
  };

  const stopTyping = (room: string = 'general') => {
    socket?.emit('typing_stop', { room });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
        messages,
        typingUsers,
        sendMessage,
        editMessage,
        deleteMessage,
        joinRoom,
        leaveRoom,
        startTyping,
        stopTyping,
        setSocket,
        setConnected,
        setOnlineUsers,
        setMessages,
        setTypingUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};