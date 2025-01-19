import { api } from './api';

// Google OAuth client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Load the Google API client
export const loadGoogleAuth = () => {
  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

// Initialize Google OAuth
export const initGoogleAuth = async () => {
  await loadGoogleAuth();
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
  });
};

// Handle the Google OAuth response
const handleGoogleResponse = async (response: { credential: string }) => {
  try {
    const { data } = await api.post('/auth/google', { token: response.credential });
    localStorage.setItem('token', data.access_token);
    window.location.reload(); // Refresh to update auth state
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get the auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Sign out
export const signOut = () => {
  localStorage.removeItem('token');
  window.location.reload();
};
