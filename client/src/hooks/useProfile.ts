import { useLocalStorage } from './useLocalStorage';
import type { UserProfile } from '../types';

export const useProfile = () => {
  const [profile, setProfile] = useLocalStorage<UserProfile>('chatflow_profile', {
    nickname: '',
    selectedAvatar: 'avatar1'
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const newProfile = {
        ...prev,
        ...updates
      };
      return newProfile;
    });
  };

  const resetProfile = () => {
    setProfile({
      nickname: '',
      selectedAvatar: 'avatar1'
    });
  };

  return {
    profile,
    updateProfile,
    resetProfile,
    setProfile
  };
};
