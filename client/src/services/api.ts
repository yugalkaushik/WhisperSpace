import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import type { User } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const verifyToken = () => api.get<{ user: User }>('/auth/profile');

// Room endpoints
export const createRoom = (data: { name: string; pin: string }) =>
  api.post<{ message: string; roomCode: string; roomName: string }>('/rooms/create', data);

export const joinRoom = (data: { roomCode: string; pin: string }) =>
  api.post<{ message: string; roomCode: string; roomName: string }>('/rooms/join', data);

export const getRoomInfo = (roomCode: string) =>
  api.get(`/rooms/${roomCode}`);

export const leaveRoom = (roomCode: string) =>
  api.delete(`/rooms/${roomCode}/leave`);

export default api;