import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import ChatRoom from '../components/chat/ChatRoom';
import { useSocket } from '../hooks/useSocket';

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
    
    const roomCode = location.state?.roomCode?.toUpperCase();
    const roomName = location.state?.roomName;
    
    if (!roomCode || !roomName) {
      navigate('/rooms');
      return;
    }

    const room: Room = {
      _id: location.state?.roomId || '',
      name: roomName,
      code: roomCode,
      pin: location.state?.pin || '',
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

  if (!roomData) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900" style={{ height: '100dvh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-indigo-300 font-sf-pro-text text-lg">Loading room...</p>
        </div>
      </div>
    );
  }

  return <ChatRoom initialRoom={{ name: roomData.name, code: roomData.code }} />;
};

export default Chat;