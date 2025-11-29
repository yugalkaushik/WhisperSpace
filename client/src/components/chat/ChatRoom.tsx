import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Menu, X, LogOut } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import UserProfileDropdown from '../profile/UserProfileDropdown';
import { AuthContext } from '../../contexts/auth-context';
import { SocketContext } from '../../contexts/socket-context';
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
  const { messages, currentRoom, leaveRoom } = useContext(SocketContext);
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
    <div
      className="app-shell flex flex-col text-white"
      style={{ minHeight: '100dvh', background: '#050505' }}
    >
      <div className="app-grid opacity-[0.08]" />

      {isMobile && isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <header className="relative z-10 border-b border-white/10 bg-[#070707]/95">
        <nav
          className="flex w-full flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8"
          aria-label="Room controls"
        >
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-5">
            <div className="flex w-full max-w-3xl items-stretch gap-3">
              {isMobile && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-2xl border border-white/10 p-2 text-slate-200 hover:bg-white/10"
                  aria-label={isMobileMenuOpen ? 'Close participant list' : 'Open participant list'}
                >
                  {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
              )}
              <div className="w-full rounded-[32px] border border-white/10 bg-[#0c0c0c] px-6 py-5 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.45em] text-slate-400">
                  <span>Current room</span>
                  <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-semibold text-sky-200">
                    ● {currentRoom ? 'Live' : 'Syncing'}
                  </span>
                </div>
                <div className="mt-3 space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold leading-tight text-white">{roomDisplayName}</h1>
                    {!currentRoom && (
                      <p className="text-sm text-slate-400">We are pairing you with the space.</p>
                    )}
                  </div>
                  {roomCode && (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#050505] px-4 py-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-500">Room ID</p>
                        <p className="font-mono text-lg tracking-[0.3em] text-white">{roomCode}</p>
                      </div>
                      <button
                        onClick={handleCopyRoomCode}
                        className="ml-auto rounded-xl border border-white/10 p-2 text-slate-300 hover:border-white/40 hover:text-white"
                        aria-label={`Copy room code ${roomCode}`}
                      >
                        {copied ? <Check size={16} className="text-sky-300" /> : <Copy size={16} />}
                      </button>
                    </div>
                  )}
                  <span className="sr-only" role="status" aria-live="polite">{copyAnnouncement}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <div className="ml-auto flex items-center overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0c0c] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              <button
                onClick={handleLeaveRoom}
                className="flex h-16 items-center gap-2 border-r border-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Leave room
              </button>
              <div className="h-16">
                <UserProfileDropdown variant="inline" />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <UserList
          isMobileView={isMobile}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <div className="flex flex-1 justify-center overflow-y-auto bg-[#050505] px-4 py-6">
          <div className="flex w-full max-w-[560px] flex-1 flex-col rounded-[38px] border border-white/10 bg-[#090909] shadow-[0_35px_80px_rgba(0,0,0,0.65)]">
            <div className="flex-1">
              <MessageList messages={messages} />
            </div>
            <div className="border-t border-white/10">
              <MessageInput variant="embedded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;