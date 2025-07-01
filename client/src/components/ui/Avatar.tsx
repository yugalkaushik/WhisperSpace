import { getAvatarInitials, getAvatarColor } from '../../utils/formatters';

interface AvatarProps {
  username: string;
  isOnline?: boolean;
}

const Avatar = ({ username, isOnline = false }: AvatarProps) => {
  const initials = getAvatarInitials(username);
  const bgColor = getAvatarColor(username);

  return (
    <div className="relative">
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold`}>
        {initials}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
      )}
    </div>
  );
};

export default Avatar;