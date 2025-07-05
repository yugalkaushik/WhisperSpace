import React, { useState } from 'react';
import { AVATAR_OPTIONS, getAvatarUrl } from '../../utils/avatars';
import { Button } from '../ui/Button';
import Input from '../ui/Input';

interface UserProfileSetupProps {
  currentUser: {
    nickname?: string;
    selectedAvatar?: string;
    username: string;
    email: string;
  };
  onSave: (data: { nickname: string; selectedAvatar: string }) => void;
  isLoading?: boolean;
}

export const UserProfileSetup: React.FC<UserProfileSetupProps> = ({
  currentUser,
  onSave,
  isLoading = false
}) => {
  const [nickname, setNickname] = useState(currentUser.nickname || currentUser.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.selectedAvatar || 'avatar1');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    // Form submit
    e.preventDefault();
    setError('');

    // Form validation
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (nickname.trim().length < 2) {
      setError('Nickname must be at least 2 characters long');
      return;
    }

    if (nickname.trim().length > 30) {
      setError('Nickname must be less than 30 characters');
      return;
    }
    onSave({
      nickname: nickname.trim(),
      selectedAvatar
    });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black p-3 overflow-hidden">
      {/* Subtle gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-black opacity-80"></div>
      
      {/* Blurred circles for depth */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-24 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl"></div>
      
      {/* Glass card with Apple-style transparency */}
      <div className="relative z-10 backdrop-blur-xl bg-black/30 p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg border border-white/10">
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-sm text-gray-300/80">
            Choose a nickname and avatar to personalize your WhisperSpace experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Nickname Section */}
          <div>
            <Input
              id="nickname"
              label="Display Nickname"
              type="text"
              value={nickname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
              placeholder="Enter your display name"
              maxLength={30}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This is how others will see you in chat rooms (instead of your Google name)
            </p>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Choose Your Avatar
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 md:gap-3 p-3 bg-black/40 backdrop-blur-md rounded-xl shadow-inner border border-white/5">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    selectedAvatar === avatar.id
                      ? 'bg-white/10 border border-white/20 shadow-lg scale-105'
                      : 'border border-white/5 hover:border-white/15 hover:bg-white/5 hover:scale-105'
                  }`}
                  title={avatar.name}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto shadow-xl transition-all duration-300 transform hover:scale-110 ring-2 ring-black overflow-hidden">
                    <img
                      src={getAvatarUrl(avatar.id)}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Select an avatar that represents you in the chat
            </p>
          </div>

          {/* Preview */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-medium text-white mb-3">Preview</h3>
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-xl transition-all duration-300">
                <img
                  src={getAvatarUrl(selectedAvatar, nickname)}
                  alt="Selected avatar"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="font-medium text-white">
                  {nickname || 'Your Nickname'}
                </p>
                <p className="text-sm text-indigo-300/80">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isLoading || !nickname.trim()}
              className="w-full py-3 text-base backdrop-blur-md bg-white/10 hover:bg-white/15 
                       border border-white/10 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-indigo-500/20"
              onClick={handleSubmit}
            >
              {isLoading ? 'Saving...' : 'Continue to WhisperSpace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
