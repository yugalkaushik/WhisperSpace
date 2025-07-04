import React, { useState, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context';
import { useProfile } from '../../hooks/useProfile';
import { getAvatarUrl } from '../../utils/avatars';

const UserProfileDropdown: React.FC = () => {
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
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right + window.scrollX,
      });
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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 
                  transition-all duration-200 text-white shadow-lg 
                  border border-zinc-700 hover:border-zinc-600"
        aria-label="User menu"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img 
              src={getAvatarUrl(profile.selectedAvatar || `avatar${displayName.charCodeAt(0) % 12 + 1}`, displayName)}
              alt={displayName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-1 ring-zinc-800"></div>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white truncate max-w-[100px]">
            {displayName}
          </p>
          <p className="text-xs text-zinc-400 truncate max-w-[100px]">
            {user.email}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
          className="fixed bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 w-64"
          style={{ 
            top: dropdownPosition.top,
            right: dropdownPosition.right,
            zIndex: 999999 
          }}
        >
          <div className="p-4 border-b border-zinc-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden">
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
              className="w-full flex items-center space-x-3 px-3 py-3 text-left 
                        text-white bg-zinc-800 hover:bg-zinc-700 
                        rounded-xl transition-colors duration-200
                        border border-zinc-700 hover:border-zinc-600"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium">Edit Profile</span>
            </button>

            <button
              onClick={handleLogout}
              onMouseDown={(e) => e.preventDefault()}
              className="w-full flex items-center space-x-3 px-3 py-3 text-left mt-1
                        text-red-200 bg-red-900/50 hover:bg-red-800/60 
                        rounded-xl transition-colors duration-200
                        border border-red-800/50 hover:border-red-700"
            >
              <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
