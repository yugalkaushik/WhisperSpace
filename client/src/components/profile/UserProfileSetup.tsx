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
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.selectedAvatar || AVATAR_OPTIONS[0].id);
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
    <div className="app-shell text-white flex flex-col overflow-hidden">
      <div className="app-grid" />
      <div className="glow-pill bg-blue-900/30 -top-10 -left-6" />
      <div className="glow-pill bg-sky-500/30 bottom-0 right-0" />

      <div className="relative z-10 flex items-center justify-center h-full p-3 sm:p-4">
        <div className="border border-white/10 bg-[rgba(15,23,42,0.75)] backdrop-blur-md p-4 sm:p-6 w-full max-w-3xl" style={{ borderRadius: 'var(--border-radius)' }}>
          <div className="text-center">
            <p className="pill-badge bg-white/10 text-slate-200">PROFILE</p>
            <h1 className="mt-2 font-semibold text-xl sm:text-2xl">Lock in your Whisper identity</h1>
            <p className="mt-2 text-slate-300 text-xs sm:text-sm">Claim a nickname and choose from art-grade portraits crafted with DiceBear's adventurer set. Every option stays crisp on 4K displays.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Input
              id="nickname"
              label="Display nickname"
              type="text"
              value={nickname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
              placeholder="ex: Midnight Orbit"
              maxLength={30}
              helperText="Visible to everyone you chat with. Keep it under 30 characters."
            />

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Avatar gallery</label>
                <span className="text-[10px] text-slate-400">Adventurer series • 4K ready</span>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isActive = selectedAvatar === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`group flex items-center justify-center border-2 p-2 transition ${
                        isActive ? 'border-white bg-white/10 shadow-lg shadow-blue-500/20' : 'border-white/5 bg-white/5 hover:border-white/30'
                      }`}
                      style={{ borderRadius: 'var(--border-radius)' }}
                    >
                      <div
                        className={`relative flex h-16 w-16 items-center justify-center border-2 ${
                          isActive ? 'border-white/80' : 'border-white/10'
                        }`}
                        style={{ backgroundImage: avatar.gradient, borderRadius: 'var(--border-radius)' }}
                      >
                        <img
                          src={getAvatarUrl(avatar.id, nickname)}
                          alt="Avatar"
                          className="h-14 w-14 object-cover"
                          style={{ borderRadius: 'var(--border-radius)' }}
                          loading="lazy"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border border-white/10 bg-[#07142b]/80 p-3" style={{ borderRadius: 'var(--border-radius)' }}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Preview</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-12 w-12 border border-white/20 bg-black/40 p-1" style={{ borderRadius: 'var(--border-radius)' }}>
                  <img
                    src={getAvatarUrl(selectedAvatar, nickname)}
                    alt="Selected avatar"
                    className="h-full w-full object-cover"
                    style={{ borderRadius: 'var(--border-radius)' }}
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-base font-semibold">{nickname || 'Your Nickname'}</p>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100" style={{ borderRadius: 'var(--border-radius)' }}>
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading || !nickname.trim()} className="w-full">
              {isLoading ? 'Saving…' : 'Continue to WhisperSpace'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
