import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth-context';
import { getAvatarUrl } from '../../utils/avatars';

interface UserProfileDropdownProps {
  variant?: 'light' | 'dark';
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ variant = 'light' }) => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditProfile = () => {
    setIsOpen(false);
    navigate('/profile-setup?edit=true');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const displayName = user.nickname || user.username;
  const avatarUrl = user.selectedAvatar ? getAvatarUrl(user.selectedAvatar) : user.avatar;
  
  // Styling based on variant
  const buttonClass = variant === 'dark' 
    ? "flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
    : "flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";
    
  const textClass = variant === 'dark' 
    ? "text-white" 
    : "text-gray-900 dark:text-white";
    
  const subtextClass = variant === 'dark' 
    ? "text-white/70" 
    : "text-gray-500 dark:text-gray-400";
    
  const iconClass = variant === 'dark' 
    ? "text-white/70" 
    : "text-gray-500";
    
  const borderClass = variant === 'dark' 
    ? "border-2 border-white dark:border-gray-800" 
    : "border-2 border-white dark:border-gray-800";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        aria-label="User menu"
      >
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ${borderClass}`}></div>
        </div>
        <div className="hidden md:block text-left">
          <p className={`text-sm font-medium ${textClass}`}>
            {displayName}
          </p>
          <p className={`text-xs ${subtextClass}`}>
            {user.email}
          </p>
        </div>
        <svg
          className={`w-4 h-4 ${iconClass} transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={handleEditProfile}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
