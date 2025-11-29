const DEFAULT_AVATAR_STYLE = 'adventurer-neutral';

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
    id: 'solstice',
    name: 'Solstice Veil',
    seed: 'solstice-veil',
    gradient: 'linear-gradient(145deg,#ff8a05,#facc15)',
    accent: '#f97316',
    backgroundColors: ['0b1120', '1f2937']
  },
  {
    id: 'nocturne',
    name: 'Nocturne Bloom',
    seed: 'nocturne-bloom',
    gradient: 'linear-gradient(145deg,#a855f7,#6366f1)',
    accent: '#a855f7',
    backgroundColors: ['0e1034', '1f165f']
  },
  {
    id: 'aether',
    name: 'Aether Drift',
    seed: 'aether-drift',
    gradient: 'linear-gradient(145deg,#2dd4bf,#0ea5e9)',
    accent: '#22d3ee',
    backgroundColors: ['031b2f', '0f2b46']
  },
  {
    id: 'ember',
    name: 'Ember Pulse',
    seed: 'ember-pulse',
    gradient: 'linear-gradient(145deg,#fb7185,#f472b6)',
    accent: '#fb7185',
    backgroundColors: ['220c1c', '3b0f2f']
  },
  {
    id: 'mirage',
    name: 'Mirage Arc',
    seed: 'mirage-arc',
    gradient: 'linear-gradient(145deg,#38bdf8,#818cf8)',
    accent: '#60a5fa',
    backgroundColors: ['071225', '152a4d']
  },
  {
    id: 'flora',
    name: 'Flora Prism',
    seed: 'flora-prism',
    gradient: 'linear-gradient(145deg,#4ade80,#22c55e)',
    accent: '#4ade80',
    backgroundColors: ['041f18', '064e3b']
  },
  {
    id: 'halo',
    name: 'Halo Courier',
    seed: 'halo-courier',
    gradient: 'linear-gradient(145deg,#f0abfc,#c084fc)',
    accent: '#d8b4fe',
    backgroundColors: ['1a1028', '291347']
  },
  {
    id: 'glacier',
    name: 'Glacier Echo',
    seed: 'glacier-echo',
    gradient: 'linear-gradient(145deg,#67e8f9,#22d3ee)',
    accent: '#67e8f9',
    backgroundColors: ['031b2d', '082f4a']
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
    radius: '45',
    size: '360'
  });

  avatar.backgroundColors.forEach(color => {
    params.append('backgroundColor', color);
  });

  return `https://api.dicebear.com/7.x/${style}/png?${params.toString()}`;
};

export const getAvatarName = (avatarId: string): string => findAvatar(avatarId).name;
