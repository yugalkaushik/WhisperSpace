import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/auth-context';
import { SocketContext } from '../contexts/socket-context';
import ChatRoom from '../components/chat/ChatRoom';
import { useSocket } from '../hooks/useSocket';
import { useRoomMessages } from '../hooks/useRoomMessages';
import type { Room } from '../types';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { setCurrentRoom } = useContext(SocketContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [roomData, setRoomData] = useState<Room | null>(null);

  // Extract room data from location state
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // If no room data is provided, redirect to room manager
    if (!location.state?.roomCode || !location.state?.roomName) {
      navigate('/rooms');
      return;
    }

    const room: Room = {
      _id: location.state.roomId || '',
      name: location.state.roomName,
      code: location.state.roomCode,
      pin: location.state.pin || '',
      members: [],
      createdBy: user,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setRoomData(room);
    setCurrentRoom?.(room);
  }, [user, navigate, location.state, setCurrentRoom]);

  // Initialize socket with room code
  useSocket(roomData?.code);
  
  // Load messages for the current room
  useRoomMessages(roomData?.code);

  if (!roomData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading room...</p>
        </div>
      </div>
    );
  }

  return <ChatRoom />;
};

export default Chat;