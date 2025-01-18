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

// Convert a string to snake_case
const toSnakeCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[']/g, '') // Remove apostrophes
    .replace(/[-\s]+/g, '_'); // Replace hyphens and spaces with underscore
};

export const getGems = async (): Promise<GemListItem[]> => {
  try {
    const response = await api.get('/gems');
    return response.data;
  } catch (error) {
    console.error('Error fetching gems:', error);
    throw new Error(`Failed to fetch gems: ${error.message}`);
  }
};

export const getGem = async (stars: number, name: string): Promise<Gem> => {
  try {
    const fileName = toSnakeCase(name);
    const filePath = `${stars}star/${fileName}.json`;
    const response = await api.get(`/gems/${filePath}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gem:', error);
    throw new Error(`Failed to fetch gem: ${error.message}`);
  }
};

export const updateGem = async (stars: number, name: string, gem: Gem): Promise<Gem> => {
  try {
    const fileName = toSnakeCase(name);
    const filePath = `${stars}star/${fileName}.json`;
    const response = await api.put(`/gems/${filePath}`, gem);
    return response.data;
  } catch (error) {
    console.error('Error updating gem:', error);
    throw new Error(`Failed to update gem: ${error.message}`);
  }
};

export const getEffectTypes = async () => {
  try {
    const response = await api.get('/effect-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching effect types:', error);
    throw new Error(`Failed to fetch effect types: ${error.message}`);
  }
};

export const exportGems = async () => {
  try {
    const response = await api.get('/export');
    return response.data;
  } catch (error) {
    console.error('Error exporting gems:', error);
    throw new Error(`Failed to export gems: ${error.message}`);
  }
};
