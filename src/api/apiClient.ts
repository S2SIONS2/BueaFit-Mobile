import * as SecureStore from 'expo-secure-store';
import { event } from '../lib/event';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const getApiUrl = () => process.env.EXPO_PUBLIC_API_URL;

// Function to refresh the access token
const refreshToken = async (): Promise<string | null> => {
  const apiUrl = getApiUrl();
  const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

  if (!apiUrl || !storedRefreshToken) {
    return null;
  }

  try {
    const details = { 'refresh_token': storedRefreshToken };
    const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');

    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: formBody,
    });

    if (response.status === 200) {
      const data = await response.json();
      const { access_token, refresh_token } = data;

      if (access_token && refresh_token) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);
        return access_token;
      }
    }
  } catch (error) {
    console.error('Token refresh failed', error);
  }

  // If refresh fails, clear all tokens to force logout
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  event.emit('sessionExpired');
  // A more robust solution would involve a global navigation instance to redirect to login
  return null;
};

// The main API client function that wraps fetch
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const apiUrl = getApiUrl();
  let token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

  if (!apiUrl) {
    throw new Error('API URL is not configured.');
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(`${apiUrl}${url}`, { ...options, headers });

  if (response.status === 401) {
    console.log('Access token expired. Attempting to refresh...');
    const newToken = await refreshToken();

    if (newToken) {
      console.log('Token refreshed successfully. Retrying original request...');
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(`${apiUrl}${url}`, { ...options, headers }); // Retry the request
    } else {
      // Refresh failed, the user is effectively logged out.
      // The refreshToken function already handled clearing tokens and alerting the user.
      throw new Error('Session expired.');
    }
  }

  return response;
};
