import React, { useState, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
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
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    <div className={`relative ${isInline ? 'h-14 sm:h-16' : ''}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 text-white transition ${
          isInline
            ? 'h-full bg-transparent hover:bg-white/5'
            : 'h-14 sm:h-16 border border-white/10 bg-[#0c0c0c] hover:bg-white/5'
        }`}
        style={{ borderRadius: isInline ? '0' : 'var(--border-radius)' }}
        aria-label="User menu"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 overflow-hidden" style={{ borderRadius: '50%' }}>
              <img 
                src={getAvatarUrl(profile.selectedAvatar || `avatar${displayName.charCodeAt(0) % 12 + 1}`, displayName)}
                alt={displayName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="hidden sm:flex sm:flex-col sm:flex-1 sm:text-left min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
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
          className="fixed w-64 sm:w-72 border border-white/10 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl p-3 shadow-2xl"
          style={{ 
            top: dropdownPosition.top,
            right: dropdownPosition.right,
            zIndex: 999999,
            borderRadius: 'var(--border-radius)'
          }}
        >
          <div className="border border-white/10 bg-white/5 p-3 sm:p-4" style={{ borderRadius: 'var(--border-radius)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 overflow-hidden" style={{ borderRadius: '50%' }}>
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

          <div className="p-2 space-y-2">
            <button
              onClick={handleEditProfile}
              onMouseDown={(e) => e.preventDefault()}
              className="flex w-full items-center gap-3 border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-white transition hover:bg-white/10 hover:border-white/20"
              style={{ borderRadius: 'var(--border-radius)' }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-medium">Edit Profile</span>
            </button>

            <button
              onClick={handleLogout}
              onMouseDown={(e) => e.preventDefault()}
              className="flex w-full items-center gap-3 border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-left text-sm text-red-100 transition hover:bg-red-500/20 hover:border-red-400/50"
              style={{ borderRadius: 'var(--border-radius)' }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserProfileDropdown;
