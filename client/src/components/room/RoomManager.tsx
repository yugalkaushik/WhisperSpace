import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context';
import Button from '../ui/Button';
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
    
    if (!user || !token) {
      setError('Authentication required. Please log in again.');
      // Redirect to login page
      navigate('/');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
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
      console.error('Room creation error:', error);
      setError(error.response?.data?.message || 'Failed to create room');
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">WhisperSpace</h1>
          <UserProfileDropdown />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Choose Your Chat Experience
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Create a private room or join an existing one with your friends
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Create Room Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Create Room
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start a new chat room and invite your friends with a secure PIN
            </p>
            <Button 
              onClick={() => {
                resetCreateForm();
                setShowCreateModal(true);
              }}
              className="w-full"
            >
              Create New Room
            </Button>
          </div>

          {/* Join Room Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Join Room
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter a room code and PIN to join an existing conversation
            </p>
            <Button 
              variant="secondary"
              onClick={() => {
                resetJoinForm();
                setShowJoinModal(true);
              }}
              className="w-full"
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
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Name
            </label>
            <Input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              maxLength={50}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              4-Digit PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
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
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
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
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Code
            </label>
            <Input
              type="text"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={8}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              4-Digit PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
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
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
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
          <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              "{createdRoomName}" is ready!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Share this room code with your friends to invite them
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
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
              <p className="text-green-600 dark:text-green-400 text-xs mt-2 flex items-center justify-center">
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
