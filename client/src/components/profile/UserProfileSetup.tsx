import React, { useState } from 'react';
import { AVATAR_OPTIONS, getAvatarUrl } from '../../utils/avatars';
import Button from '../ui/Button';
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
  externalError?: string;
  isEditing?: boolean;
}

export const UserProfileSetup: React.FC<UserProfileSetupProps> = ({
  currentUser,
  onSave,
  isLoading = false,
  externalError,
  isEditing = false
}) => {
  const [nickname, setNickname] = useState(currentUser.nickname || currentUser.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.selectedAvatar || 'avatar1');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isEditing ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isEditing 
              ? 'Update your nickname and avatar' 
              : 'Choose a nickname and avatar to personalize your WhisperSpace experience'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Nickname Section */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Nickname
            </label>
            <Input
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Choose Your Avatar
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`relative p-2 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedAvatar === avatar.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400'
                  }`}
                  title={avatar.name}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-16 h-16 rounded-full mx-auto"
                  />
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
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</h3>
            <div className="flex items-center space-x-3">
              <img
                src={getAvatarUrl(selectedAvatar)}
                alt="Selected avatar"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {nickname || 'Your Nickname'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          {(error || externalError) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error || externalError}
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isLoading || !nickname.trim()}
              className="flex-1"
            >
              {isLoading 
                ? 'Saving...' 
                : isEditing 
                  ? 'Save Changes' 
                  : 'Continue to WhisperSpace'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
