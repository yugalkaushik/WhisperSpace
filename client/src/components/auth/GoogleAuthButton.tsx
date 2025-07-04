import { useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

const GoogleAuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleGoogleLogin = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      localStorage.removeItem('chatflow_token');
      localStorage.removeItem('chatflow_user');
      localStorage.removeItem('auth_attempt_time');
      
      localStorage.setItem('auth_attempt_time', Date.now().toString());
      
      const authUrl = `${API_BASE_URL}/auth/google`;
      console.log('Redirecting to Google OAuth URL:', authUrl);
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google OAuth redirect failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full px-6 py-3.5 rounded-2xl font-medium relative overflow-hidden
                 backdrop-blur-md bg-white/10 hover:bg-white/15 
                 border border-white/10 text-white transition-all duration-300
                 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}
                 ${isHovered ? 'shadow-lg shadow-indigo-500/20' : 'shadow-md shadow-black/10'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
      
      <div className="flex items-center justify-center relative z-10">
        {/* Google logo */}
        <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full mr-2 shadow-sm">
          <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        </div>
        
        {/* Button text with loading state */}
        <span className="tracking-wide">
          {isLoading ? (
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin"></div>
              Redirecting...
            </div>
          ) : (
            'Continue with Google'
          )}
        </span>
      </div>
    </button>
  );
};

export default GoogleAuthButton;