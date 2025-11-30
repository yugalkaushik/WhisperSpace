import { useContext } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { AuthContext } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import Avatar from '../ui/Avatar';
import type { OnlineUser } from '../../types';
import { X } from 'lucide-react';

interface UserListProps {
  onClose?: () => void;
  isMobileSidebar?: boolean;
}

const UserList = ({ onClose, isMobileSidebar }: UserListProps) => {
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
    <div className={`flex flex-col text-white overflow-hidden ${isMobileSidebar ? 'w-full h-full' : 'w-64 flex-shrink-0'}`}>
      <div className="flex flex-col h-full overflow-hidden border border-white/10 bg-[#0c0c0c] p-4" style={{ borderRadius: 'var(--border-radius)' }}>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400 flex-shrink-0 pb-4">
          <div className="flex items-center gap-2">
            <span>Participants</span>
            <span className="bg-white/10 px-2 py-0.5 font-semibold" style={{ borderRadius: 'var(--border-radius)' }}>{onlineUsers.length}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 transition"
              style={{ borderRadius: 'var(--border-radius)' }}
              aria-label="Close participants"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="hide-scrollbar flex-1 min-h-0 space-y-2 overflow-y-auto">
          {onlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.userId}
              className="flex items-center gap-3 border border-white/5 bg-[#0f0f0f] px-3 py-2 hover:border-white/20"
              style={{ borderRadius: 'var(--border-radius)' }}
            >
              <Avatar
                username={onlineUser.username}
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