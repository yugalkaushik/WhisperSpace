import { getAvatarUrl } from '../../utils/avatars';

interface AvatarProps {
  username: string;
  selectedAvatar?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar = ({ username, selectedAvatar, isOnline = false, size = 'md' }: AvatarProps) => {
  // Size classes mapping - made smaller
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Online indicator size classes
  const indicatorSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  // Generate consistent avatar based on username if no selectedAvatar
  const getAvatarId = () => {
    if (selectedAvatar) return selectedAvatar;
    
    // Generate consistent avatar based on username
    let nameSum = 0;
    for (let i = 0; i < username.length; i++) {
      nameSum += username.charCodeAt(i);
    }
    
    // Determine avatar based on character sum modulo number of avatars
    const avatarNumber = (nameSum % 12) + 1;
    return `avatar${avatarNumber}`;
  };

  const avatarId = getAvatarId();
  const avatarUrl = getAvatarUrl(avatarId, username);

  return (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-md shadow-black/20 
                    ring-2 ring-black transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20`}
      >
        <img 
          src={avatarUrl} 
          alt={username} 
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback to a random color with initials if the avatar fails to load
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite error loop
            
            // Use a consistent color based on username
            let colorIndex = 0;
            for (let i = 0; i < username.length; i++) {
              colorIndex += username.charCodeAt(i);
            }
            
            const colors = ['6366f1', '8b5cf6', '3b82f6', '06b6d4', '10b981', '84cc16', 'f59e0b', 'f43f5e'];
            const randomColor = colors[colorIndex % colors.length];
            
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username.substring(0,2))}&background=${randomColor}&color=fff&bold=true&format=svg`;
          }}
        />
      </div>
      {isOnline && (
        <span className={`absolute bottom-0 right-0 ${indicatorSizeClasses[size]} bg-green-500 rounded-full
                         shadow-md shadow-black/20 ring-2 ring-zinc-900`}></span>
      )}
    </div>
  );
};

export default Avatar;