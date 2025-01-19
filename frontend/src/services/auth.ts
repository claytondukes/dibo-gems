import { api } from './api';

// Google OAuth client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Custom event for auth state changes
export const authStateChange = new EventTarget();

// Load the Google API client
export const loadGoogleAuth = () => {
  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

// Initialize Google OAuth
export const initGoogleAuth = async () => {
  console.log('Initializing Google Auth...'); // Test edit
  await loadGoogleAuth();
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });
};

// Handle the Google OAuth response
const handleGoogleResponse = async (response: { credential: string }) => {
  try {
    console.log('Google response:', response);
    const { data } = await api.post('/auth/google', { credential: response.credential });
    localStorage.setItem('token', data.access_token);
    console.log('Auth success:', data);
    authStateChange.dispatchEvent(new Event('change'));
  } catch (error) {
    console.error('Auth error:', error);
    localStorage.removeItem('token');
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get the auth token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Sign out
export const signOut = (): void => {
  localStorage.removeItem('token');
  window.google?.accounts.id.revoke(localStorage.getItem('token') || '', () => {
    console.log('Google sign-out complete');
  });
  authStateChange.dispatchEvent(new Event('change'));
};
