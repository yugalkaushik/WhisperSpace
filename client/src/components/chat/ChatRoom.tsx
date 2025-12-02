import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, LogOut, Users, ChevronRight } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import UserProfileDropdown from '../profile/UserProfileDropdown';
import { AuthContext } from '../../contexts/AuthContext';
import { SocketContext } from '../../contexts/SocketContext';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

interface ChatRoomProps {
  initialRoom?: {
    name?: string;
    code?: string;
  };
}

const ChatRoom = ({ initialRoom }: ChatRoomProps) => {
  const { token } = useContext(AuthContext);
  const { messages, currentRoom, leaveRoom, onlineUsers } = useContext(SocketContext);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copyAnnouncement, setCopyAnnouncement] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleCopyRoomCode = async () => {
    const codeToCopy = currentRoom?.code ?? initialRoom?.code;
    if (codeToCopy) {
      try {
        await navigator.clipboard.writeText(codeToCopy);
        setCopied(true);
        setCopyAnnouncement('Room code copied to clipboard.');
        setTimeout(() => setCopied(false), 2000);
        setTimeout(() => setCopyAnnouncement(''), 2200);
      } catch (error) {
        console.error('Failed to copy room code:', error);
      }
    }
  };

  const handleLeaveRoom = async () => {
    const activeRoomCode = currentRoom?.code ?? initialRoom?.code;
    if (activeRoomCode && token) {
      try {
        await axios.delete(`${API_BASE_URL}/rooms/${activeRoomCode}/leave`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        leaveRoom(activeRoomCode);
        navigate('/rooms');
      } catch (error) {
        console.error('Failed to leave room:', error);
        leaveRoom(activeRoomCode);
        navigate('/rooms');
      }
    } else {
      console.warn('No current room to leave or no token');
      navigate('/rooms');
    }
  };

  const roomDisplayName = currentRoom?.name ?? initialRoom?.name ?? 'Syncing room…';
  const roomCode = currentRoom?.code ?? initialRoom?.code ?? null;

  return (
    <div className="app-shell chat-shell flex flex-col bg-[#050505] text-white overflow-hidden">
      <div className="app-grid opacity-[0.08]" />

      {/* Mobile participants sidebar */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#050505] border-l border-white/10 z-50 transform transition-transform duration-300 p-3">
            <UserList onClose={() => setIsMobileMenuOpen(false)} isMobileSidebar={true} />
          </div>
        </>
      )}

      <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-1 justify-center bg-[#050505] p-2 sm:p-4 md:p-6 overflow-hidden">
          <div className="flex w-full max-w-7xl gap-3 sm:gap-4">
            {/* Participants Panel - Desktop only */}
            {!isMobile && <UserList isMobileSidebar={false} />}
            
            {/* Main Chat Container */}
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
              {/* Header Section */}
              <div className="flex flex-col gap-2 sm:gap-4 mb-2 sm:mb-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 border border-white/10 bg-[#0c0c0c] px-3 sm:px-4 md:px-6 py-2 sm:py-4 md:py-5" style={{ borderRadius: 'var(--border-radius)' }}>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs uppercase tracking-[0.45em] text-slate-400">
                      <span>Current room</span>
                      <span className="flex items-center gap-1 bg-sky-500/10 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-semibold text-sky-200" style={{ borderRadius: 'var(--border-radius)' }}>
                        ● {currentRoom ? 'Live' : 'Syncing'}
                      </span>
                    </div>
                    <div className="mt-1 sm:mt-3 space-y-2 sm:space-y-4">
                      <div className="space-y-0.5 sm:space-y-2">
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold leading-tight text-white">{roomDisplayName}</h1>
                        {!currentRoom && (
                          <p className="text-xs sm:text-sm text-slate-400">We are pairing you with the space.</p>
                        )}
                      </div>
                      {roomCode && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 border border-white/10 bg-[#050505] px-3 sm:px-4 py-2 sm:py-3" style={{ borderRadius: 'var(--border-radius)' }}>
                          <div>
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.5em] text-slate-500">Room ID</p>
                            <p className="font-mono text-base sm:text-lg tracking-[0.3em] text-white">{roomCode}</p>
                          </div>
                          <button
                            onClick={handleCopyRoomCode}
                            className="ml-auto border border-white/10 p-2 text-slate-300 hover:border-white/40 hover:text-white"
                            style={{ borderRadius: 'var(--border-radius)' }}
                            aria-label={`Copy room code ${roomCode}`}
                          >
                            {copied ? <Check size={16} className="text-sky-300" /> : <Copy size={16} />}
                          </button>
                        </div>
                      )}
                      <span className="sr-only" role="status" aria-live="polite">{copyAnnouncement}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-0">
                    {/* Mobile Participants Button */}
                    {isMobile && (
                      <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center gap-2 border border-white/10 bg-[#0c0c0c] px-4 h-12 hover:bg-white/5 transition"
                        style={{ borderRadius: 'var(--border-radius)' }}
                        aria-label="View participants"
                      >
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-semibold text-white">{onlineUsers.length}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </button>
                    )}
                    
                    <div className="flex items-center overflow-hidden border border-white/10 bg-[#0c0c0c]" style={{ borderRadius: 'var(--border-radius)' }}>
                    <button
                      onClick={handleLeaveRoom}
                      className="flex h-12 sm:h-14 md:h-16 items-center gap-2 border-r border-white/10 px-3 sm:px-4 md:px-6 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/5"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Leave room</span>
                      <span className="sm:hidden">Leave</span>
                    </button>
                    <div className="h-12 sm:h-14 md:h-16">
                      <UserProfileDropdown variant="inline" />
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 min-h-0 flex flex-col border border-white/10 bg-[#090909] overflow-hidden" style={{ borderRadius: 'var(--border-radius)' }}>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <MessageList messages={messages} />
                </div>
                <div className="flex-shrink-0">
                  <MessageInput variant="embedded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;