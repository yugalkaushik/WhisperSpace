import { getAvatarInitials, getAvatarColor } from '../../utils/formatters';
import { getAvatarUrl } from '../../utils/avatars';

interface AvatarProps {
  username: string;
  avatar?: string;
  selectedAvatar?: string;
  isOnline?: boolean;
}

const Avatar = ({ username, avatar, selectedAvatar, isOnline = false }: AvatarProps) => {
  const initials = getAvatarInitials(username);
  const bgColor = getAvatarColor(username);

  // Use selectedAvatar first, then fallback to avatar, then initials
  const displayAvatar = selectedAvatar ? getAvatarUrl(selectedAvatar) : avatar;

  return (
    <div className="relative">
      {displayAvatar ? (
        <img
          src={displayAvatar}
          alt={username}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold`}>
          {initials}
        </div>
      )}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
      )}
    </div>
  );
};

export default Avatar;