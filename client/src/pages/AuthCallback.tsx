import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/auth-context';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useContext(AuthContext);
  const [processingAuth, setProcessingAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (processingAuth) return;
    
    const handleCallback = async () => {
      setProcessingAuth(true);
      const token = new URLSearchParams(location.search).get('token');
      const urlError = new URLSearchParams(location.search).get('error');
      
      if (urlError) {
        setError(`Authentication failed: ${urlError}`);
        setTimeout(() => navigate('/login?error=' + urlError, { replace: true }), 2000);
        return;
      }
      
      if (token) {
        try {
          localStorage.removeItem('chatflow_token');
          localStorage.removeItem('chatflow_user');
          
          const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.data || !response.data.user) {
            throw new Error('Invalid user data received');
          }
          
          setAuthData(response.data.user, token);
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          if (response.data.user.isProfileSetup) {
            navigate('/rooms', { replace: true });
          } else {
            navigate('/profile-setup', { replace: true });
          }
        } catch {
          setError('Authentication verification failed');
          setTimeout(() => navigate('/login?error=invalid_token', { replace: true }), 2000);
        }
      } else {
        setError('No authentication token received');
        setTimeout(() => navigate('/login?error=no_token', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate, location.search, setAuthData, processingAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-700">
        {error ? (
          <div>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 font-medium mb-2">Authentication Error</p>
            <p className="text-zinc-300 text-sm">{error}</p>
            <p className="text-zinc-500 text-xs mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white font-medium mb-2">Authenticating...</p>
            <p className="text-zinc-400 text-sm">Please wait while we log you in</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;