import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Users, ArrowRight } from 'lucide-react';

interface LocationState {
  roomCode: string;
  roomName: string;
  action: 'created' | 'joined';
}

const TransitionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dots, setDots] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const state = location.state as LocationState;

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Show success animation after 2 seconds
    const successTimer = setTimeout(() => {
      setShowSuccess(true);
    }, 2000);

    // Navigate to chat after 4 seconds total
    const navigateTimer = setTimeout(() => {
      // Store the room info in localStorage before navigating
      localStorage.setItem('currentRoom', JSON.stringify({
        name: state?.roomName,
        code: state?.roomCode
      }));
      
      navigate('/chat', { 
        state: { 
          roomCode: state?.roomCode,
          roomName: state?.roomName 
        } 
      });
    }, 4000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(successTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate, state]);

  if (!state) {
    navigate('/rooms');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center p-8 max-w-md mx-auto">
        
        {/* Main Animation Container */}
        <div className="relative mb-8">
          {/* Animated Background Circle */}
          <div className={`w-32 h-32 mx-auto rounded-full border-4 border-blue-200 dark:border-blue-800 transition-all duration-1000 ${
            showSuccess ? 'scale-110 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700' : 'bg-blue-100 dark:bg-blue-900'
          }`}>
            
            {/* Icon Container */}
            <div className="flex items-center justify-center h-full">
              {!showSuccess ? (
                <Users className={`w-12 h-12 text-blue-600 dark:text-blue-400 transition-all duration-500 ${
                  showSuccess ? 'scale-0' : 'scale-100'
                }`} />
              ) : (
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 animate-bounce" />
              )}
            </div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-ping ${
                  showSuccess ? 'bg-green-400 dark:bg-green-500' : ''
                }`}
                style={{
                  top: `${20 + Math.sin(i) * 30}%`,
                  left: `${20 + Math.cos(i) * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {!showSuccess ? (
              <>
                {state.action === 'created' ? 'Creating' : 'Joining'} Room{dots}
              </>
            ) : (
              <>
                {state.action === 'created' ? 'Room Created!' : 'Room Joined!'}
              </>
            )}
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {state.action === 'created' ? 'Your room:' : 'Joining:'}
            </div>
            <div className="font-semibold text-gray-800 dark:text-white">
              {state.roomName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Code: {state.roomCode}
            </div>
          </div>

          {showSuccess && (
            <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 animate-fade-in">
              <span className="text-sm font-medium">Entering chat room</span>
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-4000 ease-out ${
              showSuccess ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{
              width: showSuccess ? '100%' : '50%',
              transition: 'width 4s ease-out'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TransitionScreen;
