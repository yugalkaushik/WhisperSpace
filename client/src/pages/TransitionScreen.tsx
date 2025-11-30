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
  const normalizedCode = state?.roomCode?.toUpperCase();

  useEffect(() => {
    if (!state) {
      return;
    }

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const successTimer = setTimeout(() => {
      setShowSuccess(true);
    }, 2000);

    const navigateTimer = setTimeout(() => {
      navigate('/chat', { 
        state: { 
          roomCode: normalizedCode,
          roomName: state?.roomName 
        } 
      });
    }, 4000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(successTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate, state, normalizedCode]);

  if (!state) {
    navigate('/rooms');
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-[#010613] via-[#041434] to-[#00040a] flex items-center justify-center overflow-hidden" style={{ height: '100vh', maxHeight: '100dvh' }}>
      <div className="text-center p-6 max-w-sm mx-auto">
        <div className="relative mb-6">
          <div className={`w-24 h-24 md:w-28 md:h-28 mx-auto rounded-full border-4 transition-all duration-1000 ${
            showSuccess ? 'scale-110 bg-[#0c2345] border-[#1d4ed8]' : 'bg-[#040b19] border-[#0b1a33]'
          }`}>
            <div className="flex items-center justify-center h-full">
              {!showSuccess ? (
                <Users className={`w-8 h-8 md:w-10 md:h-10 text-sky-300 transition-all duration-500 ${
                  showSuccess ? 'scale-0' : 'scale-100'
                }`} />
              ) : (
                <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-sky-400 animate-bounce" />
              )}
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-ping ${
                  showSuccess ? 'bg-sky-400' : 'bg-blue-500'
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

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
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

          <div className="rounded-lg border border-white/10 bg-[#050f1e]/90 p-4 shadow-lg">
            <div className="text-sm text-slate-300 mb-1">
              {state.action === 'created' ? 'Your room:' : 'Joining:'}
            </div>
            <div className="font-semibold text-white">
              {state.roomName}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Code: {normalizedCode}
            </div>
          </div>

          {showSuccess && (
            <div className="flex items-center justify-center space-x-2 text-sky-300 animate-fade-in">
              <span className="text-sm font-medium">Entering chat room</span>
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </div>
          )}
        </div>

        <div className="mt-8 w-full rounded-full h-2 bg-[#07142b]">
          <div 
            className={`h-2 rounded-full transition-all duration-4000 ease-out ${
              showSuccess ? 'bg-sky-500' : 'bg-blue-600'
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
