import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfileSetup } from '../components/profile/UserProfileSetup';
import { AuthContext } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setAuthData } = useContext(AuthContext);
  const { profile, updateProfile } = useProfile();
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check for OAuth token in cookies if user is not authenticated
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!user && !isAuthenticating) {
        setIsAuthenticating(true);
        
        // Check for auth token in cookies
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
        
        if (authCookie) {
          const token = authCookie.split('=')[1];
          
          try {
            const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.user) {
              // Clear the cookie
              document.cookie = 'auth_token=; Max-Age=0; path=/';
              
              // Set auth data
              setAuthData(response.data.user, token);
              
              // Force a page reload after successful OAuth login to ensure all context is properly initialized
              setTimeout(() => {
                window.location.reload();
              }, 500);
            } else {
              throw new Error('Invalid user data received');
            }
          } catch (error) {
            console.error('OAuth authentication failed:', error);
            // Clear the cookie and redirect to login
            document.cookie = 'auth_token=; Max-Age=0; path=/';
            navigate('/login?error=oauth_failed');
          }
        } else if (!user) {
          // No OAuth token and no user, redirect to login
          navigate('/login');
        }
        
        setIsAuthenticating(false);
      }
    };

    handleOAuthCallback();
  }, [user, setAuthData, navigate, isAuthenticating]);

  // Effect to handle navigation after profile update
  useEffect(() => {
    if (shouldNavigate && profile.nickname) {
      // Auto-refresh after 3 seconds
      const refreshTimer = setTimeout(() => {
        window.location.reload();
      }, 3000);
      
      // Navigate immediately
      navigate('/rooms');
      setShouldNavigate(false);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [shouldNavigate, profile.nickname, navigate]);

  const handleSave = async (data: { nickname: string; selectedAvatar: string }) => {
    if (!user) {
      return;
    }

    try {
      updateProfile(data);
      setShouldNavigate(true);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!user || isAuthenticating) {
    return (
      <div className="h-screen flex items-center justify-center bg-black overflow-hidden" style={{ height: '100dvh' }}>
        <div className="text-center p-8 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-700">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-medium mb-2">
            {isAuthenticating ? 'Authenticating...' : 'Loading...'}
          </p>
          <p className="text-zinc-400 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  // Combine user data with profile data from localStorage
  const currentUser = {
    ...user,
    nickname: profile.nickname || user.username,
    selectedAvatar: profile.selectedAvatar
  };

  return (
    <UserProfileSetup
      currentUser={currentUser}
      onSave={handleSave}
      isLoading={false}
    />
  );
};

export default ProfileSetupPage;
