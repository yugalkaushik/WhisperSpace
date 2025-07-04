// DiceBear Thumbs avatar configuration
export const AVATAR_OPTIONS = [
  {
    id: 'avatar1',
    name: 'Sky Blue',
    color: '69d2e7',
    seed: 'whale'
  },
  {
    id: 'avatar2',
    name: 'Coral',
    color: 'ff9e9d',
    seed: 'sunset'
  },
  {
    id: 'avatar3',
    name: 'Mint',
    color: 'a7dbd8',
    seed: 'spring'
  },
  {
    id: 'avatar4',
    name: 'Ruby',
    color: 'e84a5f',
    seed: 'ruby'
  },
  {
    id: 'avatar5',
    name: 'Lavender',
    color: 'b6a4cc',
    seed: 'mystery'
  },
  {
    id: 'avatar6',
    name: 'Forest',
    color: '4caf50',
    seed: 'forest'
  },
  {
    id: 'avatar7',
    name: 'Sunny',
    color: 'ffd34e',
    seed: 'sunny'
  },
  {
    id: 'avatar8',
    name: 'Ocean',
    color: '3498db',
    seed: 'ocean'
  },
  {
    id: 'avatar9',
    name: 'Berry',
    color: 'ee4035',
    seed: 'berry'
  },
  {
    id: 'avatar10',
    name: 'Coffee',
    color: '795548',
    seed: 'coffee'
  },
  {
    id: 'avatar11',
    name: 'Emerald',
    color: '2ecc71',
    seed: 'emerald'
  },
  {
    id: 'avatar12',
    name: 'Royal',
    color: '5e50a1',
    seed: 'royal'
  }
] as const;

export type AvatarId = typeof AVATAR_OPTIONS[number]['id'];

// Helper function to get avatar color by ID
export const getAvatarColor = (avatarId: string): string => {
  if (!avatarId) return AVATAR_OPTIONS[0].color;
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar?.color || AVATAR_OPTIONS[0].color; // Fallback to first avatar
};

// Helper function to get avatar seed by ID
export const getAvatarSeed = (avatarId: string): string => {
  if (!avatarId) return AVATAR_OPTIONS[0].seed;
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar?.seed || AVATAR_OPTIONS[0].seed; // Fallback to first avatar
};

// Helper function to get DiceBear Thumbs avatar URL
export const getAvatarUrl = (avatarId: string, username: string = ''): string => {
  const color = getAvatarColor(avatarId);
  const seed = getAvatarSeed(avatarId) || username || 'avatar';
  
  // Generate URL for DiceBear Thumbs avatar
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${color}&rotate=5`;
};

// Helper function to get avatar name by ID
export const getAvatarName = (avatarId: string): string => {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar?.name || AVATAR_OPTIONS[0].name; // Fallback to first avatar
};
