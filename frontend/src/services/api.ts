import axios, { AxiosError } from 'axios';
import { Gem, GemListItem } from '../types/gem';

// Determine the API URL based on the current window location
const API_URL = import.meta.env.VITE_API_URL;

console.log('API URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    console.log('API Response:', {
      config: response.config,
      data: response.data,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      config: error.config,
      response: error.response,
      message: error.message
    });
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
    console.log('Fetching gems...');
    const response = await api.get('/gems');
    console.log('Gems fetched:', response.data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching gems:', err);
    throw new Error(`Failed to fetch gems: ${err.message}`);
  }
};

export const getGem = async (stars: number, name: string): Promise<Gem> => {
  try {
    console.log('Fetching gem...');
    const fileName = toSnakeCase(name);
    const filePath = `${stars}star/${fileName}.json`;
    const response = await api.get(`/gems/${filePath}`);
    console.log('Gem fetched:', response.data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching gem:', err);
    throw new Error(`Failed to fetch gem: ${err.message}`);
  }
};

export const updateGem = async (stars: number, name: string, gem: Gem): Promise<Gem> => {
  try {
    console.log('Updating gem...');
    const snakeCaseName = toSnakeCase(name);
    const response = await api.put(`/gems/${stars}-${snakeCaseName}`, gem);
    console.log('Gem updated:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEffectTypes = async () => {
  try {
    console.log('Fetching effect types...');
    const response = await api.get('/effect-types');
    console.log('Effect types fetched:', response.data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching effect types:', err);
    throw new Error(`Failed to fetch effect types: ${err.message}`);
  }
};

export const exportGems = async () => {
  try {
    console.log('Exporting gems...');
    const response = await api.get('/export');
    console.log('Gems exported:', response.data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error exporting gems:', err);
    throw new Error(`Failed to export gems: ${err.message}`);
  }
};
