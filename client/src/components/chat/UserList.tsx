import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../contexts/socket-context';
import { AuthContext } from '../../contexts/auth-context';
import { useProfile } from '../../hooks/useProfile';
import Avatar from '../ui/Avatar';
import type { OnlineUser, Room } from '../../types';

interface UserListProps {
  roomData?: Room | null;
  isMobileView?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const UserList = ({ roomData, isMobileView = false, isOpen = false, onClose }: UserListProps) => {
  const { onlineUsers, currentRoom } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const { profile } = useProfile();
  const [roomInfo, setRoomInfo] = useState<{name: string; code: string} | null>(null);
  
  useEffect(() => {
    // Simplified room info logic - prioritize props and context
    if (roomData?.name && roomData?.code) {
      setRoomInfo({name: roomData.name, code: roomData.code});
    } else if (currentRoom?.name && currentRoom?.code) {
      setRoomInfo({name: currentRoom.name, code: currentRoom.code});
    }
  }, [roomData, currentRoom]);

  const getDisplayName = (onlineUser: OnlineUser) => {
    // If this is the current user, use their nickname from localStorage
    if (user && onlineUser.userId === user._id) {
      return profile.nickname || user.username;
    }
    // For other users, just use their username
    return onlineUser.username;
  };

  const getSelectedAvatar = (onlineUser: OnlineUser) => {
    // If this is the current user, use their selected avatar from localStorage
    if (user && onlineUser.userId === user._id) {
      return profile?.selectedAvatar || 'avatar1';
    }
    
    // For other users, generate consistent avatar based on username characters
    // This ensures the same user always gets the same avatar
    let nameSum = 0;
    for (let i = 0; i < onlineUser.username.length; i++) {
      nameSum += onlineUser.username.charCodeAt(i);
    }
    
    // Determine avatar based on character sum modulo 12
    const avatarNumber = (nameSum % 12) + 1;
    return `avatar${avatarNumber}`;
  };

  return (
    <div className={`
      ${isMobileView 
        ? `mobile-sidebar w-64 bg-zinc-900 ${isOpen ? 'open' : ''}`
        : 'w-48 md:w-64 bg-zinc-900'
      } 
      border-r border-zinc-800/50 flex flex-col
    `}>
      {/* Room Info */}
      <div className="p-3 md:p-4 border-b border-zinc-800/50">
        {roomInfo ? (
          <div>
            <h2 className="text-base md:text-lg font-semibold text-white font-sf-pro truncate">{roomInfo.name}</h2>
            <span className="text-xs md:text-sm text-zinc-300 font-mono">{roomInfo.code}</span>
          </div>
        ) : (
          <div className="animate-pulse">
            <div className="h-4 md:h-5 bg-zinc-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
          </div>
        )}
      </div>
      
      {/* User List */}
      <div className="flex-1 p-3 md:p-4 overflow-hidden">
        <h3 className="text-xs md:text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">
          Online ({onlineUsers.length})
        </h3>
        <div className="space-y-1 md:space-y-2 h-full overflow-y-auto">
          {onlineUsers.map((onlineUser) => (
            <div 
              key={onlineUser.userId} 
              className="flex items-center space-x-2 md:space-x-3 p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
              onClick={isMobileView ? onClose : undefined}
            >
              <Avatar 
                username={onlineUser.username} 
                isOnline={true}
                selectedAvatar={getSelectedAvatar(onlineUser)}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {getDisplayName(onlineUser)}
                </p>
                <p className="text-xs text-green-400">Online</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;