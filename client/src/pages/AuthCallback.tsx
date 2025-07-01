import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import type { User } from '../types';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setUser] = useLocalStorage<User | null>('chatflow_user', null);
  const [, setToken] = useLocalStorage<string | null>('chatflow_token', null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = new URLSearchParams(location.search).get('token');
      const error = new URLSearchParams(location.search).get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        navigate('/login?error=' + error);
        return;
      }
      
      if (token) {
        try {
          // Verify token and get user info
          const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setToken(token);
          
          // Load nickname and avatar from localStorage if they exist
          const savedNickname = localStorage.getItem(STORAGE_KEYS.NICKNAME);
          const savedAvatar = localStorage.getItem(STORAGE_KEYS.AVATAR);
          
          const user = {
            ...response.data.user,
            nickname: savedNickname || response.data.user.nickname || response.data.user.username,
            selectedAvatar: savedAvatar || response.data.user.selectedAvatar || 'avatar1'
          };
          
          setUser(user);
          
          // Check if user needs to complete profile setup
          if (!savedNickname || !savedAvatar) {
            navigate('/profile-setup');
          } else {
            navigate('/rooms');
          }
        } catch (error) {
          console.error('Token verification error:', error);
          navigate('/login?error=invalid_token');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, location, setUser, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;