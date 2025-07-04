import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfileSetup } from '../components/profile/UserProfileSetup';
import { AuthContext } from '../contexts/auth-context';
import { useProfile } from '../hooks/useProfile';

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { profile, updateProfile } = useProfile();
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Effect to handle navigation after profile update
  useEffect(() => {
    if (shouldNavigate && profile.nickname) {
      navigate('/rooms');
      setShouldNavigate(false);
    }
  }, [shouldNavigate, profile.nickname, navigate]);

  const handleSave = async (data: { nickname: string; selectedAvatar: string }) => {
    if (!user) {
      return;
    }

    try {
      // Update profile in localStorage only
      updateProfile(data);
      
      // Set flag to trigger navigation
      setShouldNavigate(true);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
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
