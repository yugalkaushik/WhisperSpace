import React, { useState, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context';
import { useProfile } from '../../hooks/useProfile';
import { getAvatarUrl } from '../../utils/avatars';

type UserProfileDropdownProps = {
  variant?: 'standalone' | 'inline';
};

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ variant = 'standalone' }) => {
  const { user, logout } = useContext(AuthContext);
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // On mobile, position dropdown from the top right corner
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right + window.scrollX,
        });
      } else {
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right + window.scrollX,
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [isOpen]);

  const handleEditProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setTimeout(() => {
      navigate('/profile-setup');
    }, 100);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    
    try {
      logout();
      localStorage.clear();
      navigate('/login', { replace: true });
    } catch {
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  if (!user) return null;

  const displayName = profile.nickname || user.username;

  const isInline = variant === 'inline';

  return (
    <div className={`relative ${isInline ? 'h-16' : ''}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between space-x-1 px-4 text-white transition md:space-x-2 ${
          isInline
            ? 'h-full rounded-none border-0 bg-transparent hover:bg-white/10'
            : 'h-16 rounded-[28px] border border-white/10 bg-white/10 shadow-lg shadow-black/30 hover:bg-white/20'
        }`}
        aria-label="User menu"
      >
        <div className="relative">
          <div className="h-8 w-8 overflow-hidden rounded-full md:h-10 md:w-10">
            <img 
              src={getAvatarUrl(profile.selectedAvatar || `avatar${displayName.charCodeAt(0) % 12 + 1}`, displayName)}
              alt={displayName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 ring-1 ring-zinc-800 md:h-3 md:w-3"></div>
        </div>
        <div className="hidden flex-1 md:block md:text-left">
          <p className="max-w-[120px] truncate text-sm font-medium text-white">
            {displayName}
          </p>
          <p className="max-w-[120px] truncate text-xs text-zinc-400">
            {user.email}
          </p>
        </div>
        <svg
          className={`h-3 w-3 md:h-4 md:w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed w-56 rounded-3xl border border-white/10 bg-black/60 p-2 shadow-2xl backdrop-blur-2xl md:w-64"
          style={{ 
            top: dropdownPosition.top,
            right: dropdownPosition.right,
            zIndex: 999999 
          }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden">
                <img 
                  src={getAvatarUrl(profile.selectedAvatar || `avatar${displayName.charCodeAt(0) % 12 + 1}`, displayName)}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={handleEditProfile}
              onMouseDown={(e) => e.preventDefault()}
              className="flex w-full items-center space-x-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-left text-sm text-white transition hover:border-white/30"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium">Edit Profile</span>
            </button>

            <button
              onClick={handleLogout}
              onMouseDown={(e) => e.preventDefault()}
              className="mt-2 flex w-full items-center space-x-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-left text-sm text-red-100 transition hover:border-red-400/50"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserProfileDropdown;
