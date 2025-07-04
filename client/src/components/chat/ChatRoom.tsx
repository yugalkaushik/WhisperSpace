import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import UserProfileDropdown from '../profile/UserProfileDropdown';
import { AuthContext } from '../../contexts/auth-context';
import { SocketContext } from '../../contexts/socket-context';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const ChatRoom = () => {
  const { token } = useContext(AuthContext);
  const { messages, currentRoom, leaveRoom } = useContext(SocketContext);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyRoomCode = async () => {
    if (currentRoom?.code) {
      try {
        await navigator.clipboard.writeText(currentRoom.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy room code:', error);
      }
    }
  };

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
    <div className="h-screen flex flex-col bg-zinc-900">
      <header className="py-4 px-6 bg-zinc-900 text-white flex justify-between items-center border-b border-zinc-800/50">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white font-sf-pro">WhisperSpace</h1>
          {currentRoom && (
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-zinc-400">•</span>
              <span className="text-white font-medium">{currentRoom.name}</span>
              <div className="flex items-center space-x-1">
                <span className="text-zinc-300 font-mono text-sm">{currentRoom.code}</span>
                <button
                  onClick={handleCopyRoomCode}
                  className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                  title="Copy room code"
                >
                  {copied ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLeaveRoom}
            className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm text-white 
                      transition-colors font-medium"
          >
            Leave Room
          </button>
          <UserProfileDropdown />
        </div>
      </header>
      
      <div className="flex flex-1 min-h-0">
        <UserList roomData={currentRoom} isMobileView={false} />
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList messages={messages} />
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;