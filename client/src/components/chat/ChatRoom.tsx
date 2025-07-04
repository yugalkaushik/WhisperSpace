import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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
    <div className="h-screen flex flex-col bg-zinc-900 overflow-hidden" style={{ height: '100dvh' }}>
      {/* Mobile overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <header className="py-2 px-3 md:py-3 md:px-4 bg-zinc-900 text-white flex justify-between items-center border-b border-zinc-800/50">
        <div className="flex items-center space-x-2 md:space-x-3">
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors md:hidden"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          )}
          <h1 className="text-base md:text-lg font-semibold text-white font-sf-pro">WhisperSpace</h1>
          {currentRoom && (
            <div className="flex items-center space-x-2 md:space-x-3 text-sm">
              <span className="text-zinc-400 hidden sm:inline">•</span>
              <span className="text-white font-medium text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{currentRoom.name}</span>
              <div className="flex items-center space-x-1">
                <span className="text-zinc-300 font-mono text-xs">{currentRoom.code}</span>
                <button
                  onClick={handleCopyRoomCode}
                  className="p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                  title="Copy room code"
                >
                  {copied ? (
                    <Check size={10} className="text-green-400 md:w-3 md:h-3" />
                  ) : (
                    <Copy size={10} className="md:w-3 md:h-3" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1.5 md:space-x-2">
          <button
            onClick={handleLeaveRoom}
            className="px-2 py-1 md:px-2.5 md:py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-white 
                      transition-colors font-medium"
          >
            Leave
          </button>
          <UserProfileDropdown />
        </div>
      </header>
      
      <div className="flex flex-1 min-h-0 relative">
        <UserList 
          roomData={currentRoom} 
          isMobileView={isMobile}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList messages={messages} />
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;