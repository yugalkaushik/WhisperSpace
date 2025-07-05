import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context';
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

  // Generate a good default room name
  const generateDefaultRoomName = () => {
    return 'Chat Room';
  };

  // Initialize with a default room name
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
    
    // Check if user and token exist and are valid
    if (!user || !token) {
      setError('Authentication required. Please log in again.');
      // Refresh the token by logging out and redirecting to login
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // First validate the token/user is still valid
      try {
        await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        // Token is invalid or user doesn't exist
        setError('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      // Now create the room
      const response = await axios.post(`${API_BASE_URL}/rooms/create`, {
        name: roomName,
        pin: roomPin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Store room data and show success modal
      setCreatedRoomCode(response.data.roomCode);
      setCreatedRoomName(roomName);
      setShowCreateModal(false);
      setShowSuccessModal(true);
      
      // Clear form data
      resetCreateForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create room');
      
      // If it's a user not found error, redirect to login
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
      const response = await axios.post(`${API_BASE_URL}/rooms/join`, {
        roomCode: joinRoomCode,
        pin: joinPin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Navigate to transition screen with room data
      navigate('/transition', { 
        state: { 
          roomCode: joinRoomCode,
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
    <div className="h-screen w-screen bg-black overflow-hidden" style={{ height: '100dvh' }}>
      {/* Subtle gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-indigo-900/10 to-black opacity-80"></div>
      
      {/* Blurred circles for depth - smaller */}
      <div className="absolute top-1/4 -left-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-16 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-black shadow-md">
        <div className="max-w-4xl mx-auto px-3 md:px-4 py-2 md:py-3 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white font-sf-pro tracking-tight">WhisperSpace</h1>
          <UserProfileDropdown />
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8 h-full overflow-hidden">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 md:mb-3 font-sf-pro">
            Choose Your Chat Experience
          </h2>
          <p className="text-gray-300 text-sm md:text-base font-sf-pro-text px-4">
            Create a private room or join an existing one with your friends
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-xl mx-auto">
          {/* Create Room Card */}
          <div className="bg-gray-900 rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-6 text-center">
            <div className="bg-blue-900 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3 font-sf-pro">
              Create Room
            </h3>
            <p className="text-gray-300 mb-3 md:mb-4 font-sf-pro-text text-xs md:text-sm">
              Start a new chat room and invite your friends with a secure PIN
            </p>
            <Button 
              onClick={() => {
                resetCreateForm();
                setShowCreateModal(true);
              }}
              className="w-full text-sm"
            >
              Create New Room
            </Button>
          </div>

          {/* Join Room Card */}
          <div className="bg-gray-900 rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-6 text-center">
            <div className="bg-green-900 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3 font-sf-pro">
              Join Room
            </h3>
            <p className="text-gray-300 mb-3 md:mb-4 font-sf-pro-text text-xs md:text-sm">
              Enter a room code and PIN to join an existing conversation
            </p>
            <Button 
              variant="secondary"
              onClick={() => {
                resetJoinForm();
                setShowJoinModal(true);
              }}
              className="w-full text-sm"
            >
              Join Existing Room
            </Button>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
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

      {/* Join Room Modal */}
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
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-md">{error}</div>
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

      {/* Room Created Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Room Created Successfully!"
      >
        <div className="text-center space-y-6">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-white/10">
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              "{createdRoomName}" is ready!
            </h3>
            <p className="text-gray-300/80 text-sm">
              Share this room code with your friends to invite them
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/10">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Code
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={createdRoomCode}
                onChange={() => {}} // dummy function for readOnly input
                readOnly
                className="text-center font-mono text-lg font-semibold tracking-widest"
              />
              <Button
                variant="secondary"
                onClick={copyRoomCode}
                className="px-3 py-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-green-400 text-xs mt-2 flex items-center justify-center">
                <Check className="w-3 h-3 mr-1" />
                Copied to clipboard!
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={resetSuccessModal}
              className="flex-1"
            >
              Create Another
            </Button>
            <Button
              onClick={joinCreatedRoom}
              className="flex-1"
            >
              Enter Room
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomManager;
