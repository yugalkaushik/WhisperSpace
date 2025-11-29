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
      className={`group relative w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-left text-white shadow-2xl shadow-indigo-900/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <span className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0b2e5c]/60 via-[#0d3e7d]/45 to-[#010714]/70 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></span>
      <span className="absolute inset-0 rounded-2xl border border-white/30 opacity-20"></span>
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg">
          <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold tracking-tight text-white">{isLoading ? 'Connecting to Google' : 'Continue with Google'}</p>
          <p className="text-xs text-slate-300">We never post or store without your permission.</p>
        </div>
        {isLoading ? (
          <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
        ) : (
          <svg className="h-4 w-4 text-slate-200 transition group-hover:translate-x-1" viewBox="0 0 20 20" fill="none">
            <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
};

export default GoogleAuthButton;