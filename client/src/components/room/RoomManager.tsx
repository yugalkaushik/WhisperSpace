import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import UserProfileDropdown from '../profile/UserProfileDropdown';
import { Plus, Users, Lock, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';
import axios from 'axios';

const RoomManager = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomPin, setRoomPin] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinPin, setJoinPin] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [createdRoomName, setCreatedRoomName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateDefaultRoomName = () => {
    return 'Chat Room';
  };

  useEffect(() => {
    if (!roomName) {
      setRoomName(generateDefaultRoomName());
    }
  }, [roomName]);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || roomPin.length !== 4) {
      setError('Room name is required and PIN must be 4 digits');
      return;
    }
    
    if (!user || !token) {
      setError('Authentication required. Please log in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      try {
        await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/rooms/create`, {
        name: roomName,
        pin: roomPin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCreatedRoomCode(response.data.roomCode);
      setCreatedRoomName(roomName);
      setShowCreateModal(false);
      setShowSuccessModal(true);
      
      resetCreateForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create room');
      
      if (error.response?.data?.message === 'User not found') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomCode.trim() || joinPin.length !== 4) {
      setError('Room code and 4-digit PIN are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedCode = joinRoomCode.trim().toUpperCase();
      const response = await axios.post(`${API_BASE_URL}/rooms/join`, {
        roomCode: formattedCode,
        pin: joinPin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/transition', { 
        state: { 
          roomCode: response.data.roomCode || formattedCode,
          roomName: response.data.roomName,
          action: 'joined'
        }
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(createdRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy room code:', error);
    }
  };

  const joinCreatedRoom = () => {
    navigate('/transition', { 
      state: { 
        roomCode: createdRoomCode,
        roomName: createdRoomName,
        action: 'created'
      }
    });
  };

  const resetCreateForm = () => {
    setRoomName(generateDefaultRoomName());
    setRoomPin('');
    setError('');
    setCopied(false);
  };

  const resetJoinForm = () => {
    setJoinRoomCode('');
    setJoinPin('');
    setError('');
  };

  const resetSuccessModal = () => {
    setCreatedRoomCode('');
    setCreatedRoomName('');
    setCopied(false);
    setShowSuccessModal(false);
  };

  return (
    <div className="app-shell text-white flex flex-col overflow-hidden">
      <div className="app-grid" />
      <div className="glow-pill bg-blue-900/40 -top-10 -left-6" />
      <div className="glow-pill bg-sky-600/30 bottom-0 right-0" />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <div className="flex flex-1 justify-center bg-[#050505] p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="flex flex-col w-full max-w-6xl gap-4 sm:gap-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between flex-shrink-0">
              <div>
                <span className="pill-badge bg-white/5 text-slate-200">Control center</span>
                <h1 className="mt-2 sm:mt-3 font-semibold tracking-tight text-white text-2xl sm:text-3xl md:text-4xl">
                  WhisperSpace Rooms
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mt-1 sm:mt-2">
                  Spin up a fresh invite-only room or hop back into an existing space.
                </p>
              </div>
              <div className="flex w-full justify-end sm:w-auto flex-shrink-0">
                <div className="flex w-full overflow-hidden border border-white/10 bg-[#0c0c0c] sm:w-auto" style={{ borderRadius: 'var(--border-radius)' }}>
                  <div className="flex h-14 sm:h-16 flex-1 items-center gap-3 border-r border-white/10 px-3 sm:px-4">
                    <div className="relative flex h-2.5 w-2.5 items-center justify-center flex-shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping bg-sky-400/50" style={{ borderRadius: '50%' }} />
                      <span className="relative inline-flex h-2.5 w-2.5 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" style={{ borderRadius: '50%' }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-slate-400">Status</p>
                      <p className="text-sm font-semibold text-white truncate">Online</p>
                    </div>
                  </div>
                  <div>
                    <UserProfileDropdown variant="inline" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="border border-white/10 bg-[rgba(15,23,42,0.75)] backdrop-blur-md flex h-full flex-col gap-3 sm:gap-4 p-4 sm:p-6" style={{ borderRadius: 'var(--border-radius)' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/10 p-2 sm:p-3" style={{ borderRadius: 'var(--border-radius)' }}>
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400">Host</p>
                <h3 className="text-lg sm:text-xl font-semibold">Create a private room</h3>
              </div>
            </div>
            <div className="mt-3 flex flex-1 flex-col gap-6 text-sm text-slate-300">
              <p>
                Name the space, set a four-digit pin, and invite only the folks you trust.
              </p>
              <div className="space-y-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Lock size={14} />
                  Secure PIN unlock only
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  Unlimited listeners, low latency
                </div>
              </div>
            </div>
            <Button
              size="lg"
              className="mt-4 sm:mt-6 w-full"
              onClick={() => {
                resetCreateForm();
                setShowCreateModal(true);
              }}
            >
              Create new room
            </Button>
          </div>

          <div className="border border-white/10 bg-[rgba(15,23,42,0.75)] backdrop-blur-md flex h-full flex-col gap-3 sm:gap-4 p-4 sm:p-6" style={{ borderRadius: 'var(--border-radius)' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/10 p-2 sm:p-3" style={{ borderRadius: 'var(--border-radius)' }}>
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400">Join</p>
                <h3 className="text-lg sm:text-xl font-semibold">Enter an invite code</h3>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex flex-1 flex-col text-xs sm:text-sm text-slate-300">
              <p>Drop in the code plus PIN and we snap you back into the right room with synced context.</p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="mt-4 sm:mt-6 w-full"
              onClick={() => {
                resetJoinForm();
                setShowJoinModal(true);
              }}
            >
              Join existing room
            </Button>
          </div>
        </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Create New Room"
      >
        <div className="space-y-4">
          <div>
            <Input
              id="room-name"
              label="Room Name"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              maxLength={50}
            />
          </div>
          
          <div>
            <label htmlFor="room-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              4-Digit PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="room-pin"
                type="password"
                value={roomPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setRoomPin(value);
                }}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This PIN will be required for others to join your room
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-md">{error}</div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={loading || !roomName.trim() || roomPin.length !== 4}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)}
        title="Join Room"
      >
        <div className="space-y-4">
          <div>
            <Input
              id="join-room-code"
              label="Room Code"
              type="text"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={8}
            />
          </div>
          
          <div>
            <label htmlFor="join-pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              4-Digit PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="join-pin"
                type="password"
                value={joinPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setJoinPin(value);
                }}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-sm backdrop-blur-md" style={{ borderRadius: 'var(--border-radius)' }}>{error}</div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowJoinModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinRoom}
              disabled={loading || !joinRoomCode.trim() || joinPin.length !== 4}
              className="flex-1"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Room Created Successfully!"
      >
        <div className="space-y-6">
          <div className="border border-white/10 bg-gradient-to-b from-[#0a1d3c]/80 via-[#050e21]/70 to-transparent p-6 text-center" style={{ borderRadius: 'var(--border-radius)' }}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-slate-950">
                <Check className="h-8 w-8" />
              </div>
            </div>
            <p className="mt-5 text-xs uppercase tracking-[0.45em] text-sky-200">Room online</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">"{createdRoomName}" is ready.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">Send the code below to instantly sync friends into your new space.</p>
          </div>

          <div className="border border-white/10 bg-black/35 p-5" style={{ borderRadius: 'var(--border-radius)' }}>
            <div className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.5em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Room code</span>
              {copied ? (
                <span className="flex items-center gap-1 text-sky-300">
                  <Check className="h-3 w-3" /> Copied
                </span>
              ) : (
                <span className="text-slate-500">Share securely</span>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-14 flex-1 items-center justify-center border border-white/15 bg-gradient-to-r from-[#071830]/90 via-[#041025]/80 to-[#020812]/70 px-4 font-mono text-2xl tracking-[0.55em] text-white" style={{ borderRadius: 'var(--border-radius)' }}>
                {createdRoomCode || '--------'}
              </div>
              <button
                type="button"
                onClick={copyRoomCode}
                className={`flex h-14 min-w-[140px] items-center justify-center border px-6 text-sm font-semibold transition ${
                  copied
                    ? 'border-sky-400/60 bg-sky-500/10 text-sky-200'
                    : 'border-white/15 bg-[#08142c]/80 text-white hover:bg-[#0d1c3c]/80'
                }`}
                style={{ borderRadius: 'var(--border-radius)' }}
                aria-label="Copy room code"
              >
                {copied ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Copy className="h-4 w-4" /> Copy code
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="border border-white/10 bg-[#07142b]/85 p-5 text-center" style={{ borderRadius: 'var(--border-radius)' }}>
            <p className="text-sm text-slate-300">Room pins auto-reset when everyone leaves. Jump in now or spin another private space.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="secondary"
                onClick={resetSuccessModal}
                className="flex-1"
              >
                Create another
              </Button>
              <Button
                onClick={joinCreatedRoom}
                className="flex-1"
              >
                Enter room
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomManager;
