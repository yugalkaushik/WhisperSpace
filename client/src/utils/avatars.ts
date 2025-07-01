// Avatar options - using high-quality cartoon avatars
export const AVATAR_OPTIONS = [
  {
    id: 'avatar1',
    name: 'Space Explorer',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar2',
    name: 'Cosmic Wanderer',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar3',
    name: 'Digital Nomad',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar4',
    name: 'Code Ninja',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar5',
    name: 'Tech Wizard',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar6',
    name: 'Pixel Pioneer',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar7',
    name: 'Chat Master',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar8',
    name: 'Data Explorer',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar9',
    name: 'Cloud Surfer',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=River&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar10',
    name: 'Byte Bender',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sky&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar11',
    name: 'Signal Sender',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ocean&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  },
  {
    id: 'avatar12',
    name: 'Network Navigator',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Storm&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&style=circle'
  }
] as const;

export type AvatarId = typeof AVATAR_OPTIONS[number]['id'];

// Helper function to get avatar URL by ID
export const getAvatarUrl = (avatarId: string): string => {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar?.url || AVATAR_OPTIONS[0].url; // Fallback to first avatar
};

// Helper function to get avatar name by ID
export const getAvatarName = (avatarId: string): string => {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar?.name || AVATAR_OPTIONS[0].name; // Fallback to first avatar
};
