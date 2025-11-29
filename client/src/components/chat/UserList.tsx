import { useContext } from 'react';
import { SocketContext } from '../../contexts/socket-context';
import { AuthContext } from '../../contexts/auth-context';
import { useProfile } from '../../hooks/useProfile';
import Avatar from '../ui/Avatar';
import type { OnlineUser } from '../../types';

interface UserListProps {
  isMobileView?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const UserList = ({ isMobileView = false, isOpen = false, onClose }: UserListProps) => {
  const { onlineUsers } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const { profile } = useProfile();

  const getDisplayName = (onlineUser: OnlineUser) => {
    if (user && onlineUser.userId === user._id) {
      return profile.nickname || user.username;
    }
    return onlineUser.username;
  };

  const getSelectedAvatar = (onlineUser: OnlineUser) => {
    if (user && onlineUser.userId === user._id) {
      return profile?.selectedAvatar || 'avatar1';
    }

    let nameSum = 0;
    for (let i = 0; i < onlineUser.username.length; i++) {
      nameSum += onlineUser.username.charCodeAt(i);
    }
    const avatarNumber = (nameSum % 12) + 1;
    return `avatar${avatarNumber}`;
  };

  return (
    <div
      className={`${
        isMobileView
          ? `mobile-sidebar w-64 bg-[#050505]/95 ${isOpen ? 'open' : ''}`
          : 'hidden border-r border-white/10 bg-[#080808] md:flex md:w-60'
      } flex-col text-white`}
    >
          <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
          <span>Participants</span>
          <span>{onlineUsers.length}</span>
        </div>
            <div className="modern-scroll mt-4 space-y-2 overflow-y-auto pr-1">
          {onlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.userId}
                  className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0f0f0f] px-3 py-2 hover:border-white/20"
              onClick={isMobileView ? onClose : undefined}
            >
              <Avatar
                username={onlineUser.username}
                isOnline={true}
                selectedAvatar={getSelectedAvatar(onlineUser)}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{getDisplayName(onlineUser)}</p>
                <p className="text-xs text-sky-300">Live</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;