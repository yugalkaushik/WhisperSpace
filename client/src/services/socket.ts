import io from 'socket.io-client';
import { STORAGE_KEYS } from '../utils/constants';

// Helper function to get token correctly from localStorage
const getToken = () => {
  const tokenRaw = localStorage.getItem('chatflow_token');
  if (!tokenRaw) return undefined;
  
  try {
    // useLocalStorage JSON.stringify's everything, so parse it
    const parsed = JSON.parse(tokenRaw);
    return parsed;
  } catch {
    return tokenRaw;
  }
};

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: {
    token: getToken(),
    nickname: localStorage.getItem(STORAGE_KEYS.NICKNAME) || undefined,
    selectedAvatar: localStorage.getItem(STORAGE_KEYS.AVATAR) || undefined,
  },
  transports: ["polling", "websocket"],
  withCredentials: true,
  upgrade: true,
  rememberUpgrade: false,
});

export default socket;