import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfileSetup } from '../components/profile/UserProfileSetup';
import { AuthContext } from '../contexts/auth-context';
import { STORAGE_KEYS } from '../utils/constants';

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setAuthData } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const searchParams = new URLSearchParams(location.search);
  const isEditing = searchParams.get('edit') === 'true';

  const handleSave = async (data: { nickname: string; selectedAvatar: string }) => {
    if (!user) {
      setError('User not found. Please login again.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      console.log('Saving profile to localStorage:', data);
      
      // Store nickname and avatar in localStorage
      localStorage.setItem(STORAGE_KEYS.NICKNAME, data.nickname);
      localStorage.setItem(STORAGE_KEYS.AVATAR, data.selectedAvatar);
      
      // Update the user data in auth context to include the profile data
      const updatedUser = {
        ...user,
        nickname: data.nickname,
        selectedAvatar: data.selectedAvatar
      };
      
      const currentToken = localStorage.getItem('chatflow_token') || '';
      setAuthData(updatedUser, currentToken);

      console.log('Profile saved successfully, navigating...');
      // Navigate back - if editing, go to rooms, if initial setup, go to rooms
      navigate('/rooms');
    } catch (error: unknown) {
      console.error('Failed to save profile:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <UserProfileSetup
      currentUser={user}
      onSave={handleSave}
      isLoading={isLoading}
      externalError={error}
      isEditing={isEditing}
    />
  );
};

export default ProfileSetupPage;
