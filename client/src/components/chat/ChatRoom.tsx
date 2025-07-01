import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import ThemeToggle from '../ui/ThemeToggle';
import UserProfileDropdown from '../profile/UserProfileDropdown';
import { AuthContext } from '../../contexts/auth-context';
import { SocketContext } from '../../contexts/socket-context';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const ChatRoom = () => {
  const { token } = useContext(AuthContext);
  const { messages, currentRoom, leaveRoom } = useContext(SocketContext);
  const navigate = useNavigate();

  const handleLeaveRoom = async () => {
    if (currentRoom && token) {
      try {
        // Call API to leave room
        await axios.delete(`${API_BASE_URL}/rooms/${currentRoom.code}/leave`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Emit socket event to leave room
        leaveRoom(currentRoom.code);
        
        // Navigate back to room manager
        navigate('/rooms');
      } catch (error) {
        console.error('Failed to leave room:', error);
        // Still try to leave via socket and navigate
        leaveRoom(currentRoom.code);
        navigate('/rooms');
      }
    } else {
      console.warn('No current room to leave or no token');
      navigate('/rooms');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">WhisperSpace</h1>
          {currentRoom && (
            <>
              <span className="text-sm opacity-75">•</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentRoom.name}</span>
                <span className="text-xs opacity-75">Room: {currentRoom.code}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={handleLeaveRoom}
            className="text-white hover:text-gray-200 text-sm px-3 py-1 rounded border border-white/20 hover:bg-white/10 transition-colors"
          >
            Leave Room
          </button>
          <UserProfileDropdown variant="dark" />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <UserList />
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} />
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;