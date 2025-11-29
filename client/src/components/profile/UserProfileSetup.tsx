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
    <div className="app-shell flex items-center justify-center px-4 py-10 text-white">
      <div className="app-grid" />
      <div className="glow-pill bg-blue-900/30 -top-10 -left-6" />
      <div className="glow-pill bg-sky-500/30 bottom-0 right-0" />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="frosted-card rounded-[32px] p-6 md:p-10">
          <div className="text-center">
            <p className="pill-badge bg-white/10 text-slate-200">PROFILE</p>
            <h1 className="mt-4 text-3xl font-semibold md:text-4xl">Lock in your Whisper identity</h1>
            <p className="mt-3 text-slate-300">Claim a nickname and choose from art-grade portraits crafted with DiceBear’s adventurer set. Every option stays crisp on 4K displays.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
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
                <label className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Avatar gallery</label>
                <span className="text-xs text-slate-400">Adventurer series • 4K ready</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isActive = selectedAvatar === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`group flex flex-col items-center gap-3 rounded-[32px] border-2 px-4 py-4 transition ${
                        isActive ? 'border-white bg-white/10 shadow-2xl shadow-blue-500/20' : 'border-transparent bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <div
                        className={`relative flex h-24 w-24 items-center justify-center rounded-[36px] border-2 ${
                          isActive ? 'border-white/80' : 'border-white/10'
                        }`}
                        style={{ backgroundImage: avatar.gradient }}
                      >
                        <img
                          src={getAvatarUrl(avatar.id, nickname)}
                          alt={avatar.name}
                          className="h-20 w-20 rounded-3xl object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-sm font-semibold text-white">{avatar.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#07142b]/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-16 w-16 rounded-2xl border border-white/20 bg-black/40 p-1">
                  <img
                    src={getAvatarUrl(selectedAvatar, nickname)}
                    alt="Selected avatar"
                    className="h-full w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">{nickname || 'Your Nickname'}</p>
                  <p className="text-sm text-slate-400">{currentUser.email}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading || !nickname.trim()} size="lg" className="w-full">
              {isLoading ? 'Saving…' : 'Continue to WhisperSpace'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
