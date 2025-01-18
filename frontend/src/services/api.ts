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
  try {
    const response = await api.get('/gems');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch gems: ${error.message}`);
  }
};

export const getGem = async (stars: number, name: string): Promise<Gem> => {
  try {
    const response = await api.get(`/gems/${stars}/${name}`);
    console.log('API Response for getGem:', response.data); // Add logging
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch gem ${name}: ${error.message}`);
  }
};

export const updateGem = async (stars: number, name: string, gem: Gem): Promise<Gem> => {
  try {
    const response = await api.put(`/gems/${stars}/${name}`, gem);
    return response.data;
  } catch (error) {
    const errorMessage = await error.response.text();
    throw new Error(`Failed to update gem: ${errorMessage}`);
  }
};

export const exportGems = async () => {
  try {
    const response = await api.get('/export');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to export gems: ${error.message}`);
  }
};
