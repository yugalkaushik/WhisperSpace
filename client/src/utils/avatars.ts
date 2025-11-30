const DEFAULT_AVATAR_STYLE = 'fun-emoji';

type AvatarOption = {
  id: string;
  name: string;
  seed: string;
  gradient: string;
  accent: string;
  backgroundColors: [string, string];
  style?: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar1',
    name: '',
    seed: 'Felix',
    gradient: 'linear-gradient(145deg,#ff8a05,#facc15)',
    accent: '#f97316',
    backgroundColors: ['ff8a05', 'facc15'],
    style: 'fun-emoji'
  },
  {
    id: 'avatar2',
    name: '',
    seed: 'Aneka',
    gradient: 'linear-gradient(145deg,#a855f7,#6366f1)',
    accent: '#a855f7',
    backgroundColors: ['a855f7', '6366f1'],
    style: 'fun-emoji'
  },
  {
    id: 'avatar3',
    name: '',
    seed: 'Leo',
    gradient: 'linear-gradient(145deg,#2dd4bf,#0ea5e9)',
    accent: '#22d3ee',
    backgroundColors: ['2dd4bf', '0ea5e9'],
    style: 'fun-emoji'
  },
  {
    id: 'avatar4',
    name: '',
    seed: 'Luna',
    gradient: 'linear-gradient(145deg,#fb7185,#f472b6)',
    accent: '#fb7185',
    backgroundColors: ['fb7185', 'f472b6'],
    style: 'fun-emoji'
  },
  {
    id: 'avatar5',
    name: '',
    seed: 'Max',
    gradient: 'linear-gradient(145deg,#38bdf8,#818cf8)',
    accent: '#60a5fa',
    backgroundColors: ['38bdf8', '818cf8'],
    style: 'fun-emoji'
  },
  {
    id: 'avatar6',
    name: '',
    seed: 'Sophie',
    gradient: 'linear-gradient(145deg,#4ade80,#22c55e)',
    accent: '#4ade80',
    backgroundColors: ['4ade80', '22c55e'],
    style: 'fun-emoji'
  },
  {
    id: 'avatar7',
    name: '',
    seed: 'Oliver',
    gradient: 'linear-gradient(145deg,#f0abfc,#c084fc)',
    accent: '#d8b4fe',
    backgroundColors: ['f0abfc', 'c084fc'],
    style: 'fun-emoji'
  },
  {
    id: 'avatar8',
    name: '',
    seed: 'Emma',
    gradient: 'linear-gradient(145deg,#67e8f9,#22d3ee)',
    accent: '#67e8f9',
    backgroundColors: ['67e8f9', '22d3ee'],
    style: 'fun-emoji'
  }
];

export type AvatarId = (typeof AVATAR_OPTIONS)[number]['id'];

const findAvatar = (avatarId?: string): AvatarOption => {
  if (!avatarId) return AVATAR_OPTIONS[0];
  return AVATAR_OPTIONS.find(avatar => avatar.id === avatarId) || AVATAR_OPTIONS[0];
};

export const getAvatarColor = (avatarId: string): string => findAvatar(avatarId).backgroundColors[0];

export const getAvatarSeed = (avatarId: string): string => findAvatar(avatarId).seed;

export const getAvatarUrl = (avatarId: string, username: string = ''): string => {
  const avatar = findAvatar(avatarId);
  const style = avatar.style || DEFAULT_AVATAR_STYLE;
  const seed = avatar.seed || username || 'avatar';

  const params = new URLSearchParams({
    seed,
    backgroundType: 'gradientLinear',
    radius: '50',
    size: '200'
  });

  avatar.backgroundColors.forEach(color => {
    params.append('backgroundColor', color);
  });

  return `https://api.dicebear.com/9.x/${style}/png?${params.toString()}`;
};

export const getAvatarName = (avatarId: string): string => findAvatar(avatarId).name;
