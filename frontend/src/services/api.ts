import axios, { AxiosError } from 'axios';
import { Gem, GemListItem } from '../types/gem';

// Determine the API URL based on the current window location
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000'
  : `http://${window.location.hostname}:8000`;

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

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
    const err = error as AxiosError;
    console.error('Error fetching gems:', err);
    throw new Error(`Failed to fetch gems: ${err.message}`);
  }
};

export const getGem = async (stars: number, name: string): Promise<Gem> => {
  try {
    const fileName = toSnakeCase(name);
    const filePath = `${stars}star/${fileName}.json`;
    const response = await api.get(`/gems/${filePath}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching gem:', err);
    throw new Error(`Failed to fetch gem: ${err.message}`);
  }
};

export const updateGem = async (stars: number, name: string, gem: Gem): Promise<Gem> => {
  try {
    const fileName = toSnakeCase(name);
    const filePath = `${stars}star/${fileName}.json`;
    const response = await api.put(`/gems/${filePath}`, gem);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error updating gem:', err);
    throw new Error(`Failed to update gem: ${err.message}`);
  }
};

export const getEffectTypes = async () => {
  try {
    const response = await api.get('/effect-types');
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching effect types:', err);
    throw new Error(`Failed to fetch effect types: ${err.message}`);
  }
};

export const exportGems = async () => {
  try {
    const response = await api.get('/export');
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error exporting gems:', err);
    throw new Error(`Failed to export gems: ${err.message}`);
  }
};
