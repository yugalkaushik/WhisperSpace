import io from 'socket.io-client';
import { STORAGE_KEYS } from '../utils/constants';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: {
    token: localStorage.getItem(STORAGE_KEYS.TOKEN) || undefined,
  },
});

export default socket;