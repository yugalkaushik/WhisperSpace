import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const [mounted, setMounted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    setMounted(true);
    
    // Check for authentication errors
    const error = new URLSearchParams(location.search).get('error');
    if (error) {
      setAuthError(error);
      
      // Clear error from URL after displaying
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Clear any stale auth data on mount to prevent issues
    if (window.location.pathname === '/login') {
      localStorage.removeItem('auth_attempt_time');
    }
  }, [location.search]);
  
  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string): string => {
    switch(errorCode) {
      case 'auth_failed':
        return 'Authentication failed. Please try again.';
      case 'invalid_token':
        return 'Your authentication token is invalid. Please sign in again.';
      case 'no_token':
        return 'No authentication token was found. Please sign in.';
      case 'server_error':
        return 'Server error occurred. Please try again later.';
      default:
        return 'An error occurred during sign in. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Subtle gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-black opacity-80"></div>
      
      {/* Blurred circles for depth */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
      
      {/* Glass card with Apple-style transparency */}
      <div className={`relative z-10 backdrop-blur-xl bg-black/30 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md 
                     border border-white/10 transition-all duration-700 ease-out transform 
                     ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white font-montserrat tracking-tight">
            WhisperSpace
          </h1>
          
          <p className="text-gray-300/80 mb-6 md:mb-8 font-light text-sm md:text-base">
            Connect and chat with people around the world
          </p>
          
          {authError && (
            <div className="bg-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 md:mb-8 backdrop-blur-md border border-red-500/20 text-sm">
              {getErrorMessage(authError)}
            </div>
          )}
          
          <GoogleAuthButton />
        </div>
      </div>
    </div>
  );
};

export default Login;