import axios from 'axios';
import { Gem, GemListItem } from '../types/gem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials for CORS
  withCredentials: true,
});

export const getGems = async (): Promise<GemListItem[]> => {
  const response = await api.get('/gems');
  return response.data;
};

export const getGem = async (stars: number, name: string): Promise<Gem> => {
  const response = await api.get(`/gems/${stars}/${name}`);
  return response.data;
};

export const updateGem = async (stars: number, name: string, gem: Gem): Promise<Gem> => {
  const response = await api.put(`/gems/${stars}/${name}`, gem);
  return response.data;
};

export const exportGems = async () => {
  const response = await api.get('/export');
  return response.data;
};
