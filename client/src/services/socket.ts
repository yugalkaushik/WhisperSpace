import io from 'socket.io-client';
import { STORAGE_KEYS, SOCKET_URL } from '../utils/constants';

const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem(STORAGE_KEYS.TOKEN) || undefined,
  },
});

export default socket;