export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const STORAGE_KEYS = {
  TOKEN: 'chatflow_token',
  USER: 'chatflow_user',
  THEME: 'chatflow_theme',
  NICKNAME: 'user_nickname',
  AVATAR: 'user_avatar',
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  EMOJI: 'emoji',
  IMAGE: 'image',
} as const;

export const ROOMS = {
  GENERAL: 'general',
  RANDOM: 'random',
  TECH: 'tech',
  MUSIC: 'music',
} as const;

export const TYPING_TIMEOUT = 1000;
export const MESSAGE_LIMIT = 50;
export const MAX_MESSAGE_LENGTH = 1000;
export const EDIT_TIME_LIMIT = 15 * 60 * 1000;

export const EMOJI_CATEGORIES = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😌',
  '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞',
  '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺',
  '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶',
];

export const DEFAULT_AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];