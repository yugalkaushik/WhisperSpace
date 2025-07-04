import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/auth-context';
import { SocketContext } from '../contexts/socket-context';
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
    
    // Get room info from state or URL
    let roomCode = location.state?.roomCode;
    let roomName = location.state?.roomName;
    
    // If we don't have room data from state, try to get it from URL or localStorage
    if (!roomCode || !roomName) {
      // Try localStorage first
      try {
        const stored = localStorage.getItem('currentRoom');
        if (stored) {
          const parsedRoom = JSON.parse(stored);
          roomCode = parsedRoom.code;
          roomName = parsedRoom.name;
          console.log('Retrieved room data from localStorage:', parsedRoom);
        }
      } catch {
        console.log('Error getting room from localStorage');
      }
      
      // If still no room data, redirect to room manager
      if (!roomCode || !roomName) {
        navigate('/rooms');
        return;
      }
    }

    // Create room object and update context
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

    // Set room data in state and context
    setRoomData(room);
    setCurrentRoom?.(room);
    
    // Store room info in localStorage for components that need it
    localStorage.setItem('currentRoom', JSON.stringify({
      name: room.name,
      code: room.code
    }));
  }, [user, navigate, location.state, setCurrentRoom]);

  // Initialize socket with room code
  useSocket(roomData?.code);

  if (!roomData) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-indigo-300 font-sf-pro-text text-lg">Loading room...</p>
        </div>
      </div>
    );
  }

  return <ChatRoom />;
};

export default Chat;