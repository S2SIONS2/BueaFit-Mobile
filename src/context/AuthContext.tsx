import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiFetch } from '@/src/api/apiClient';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthContextType {
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadToken();
  }, []);

  const signIn = async (email: string, password: string) => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) {
      Alert.alert('Error', 'API URL is not configured.');
      return;
    }

    try {
      const details: { [key: string]: string } = {
        'username': email,
        'password': password,
        'grant_type': 'password'
      };
      const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: formBody,
      });

      if (response.status === 200) {
        const data = await response.json();
        const { access_token, refresh_token } = data;

        if (access_token && refresh_token) {
          setToken(access_token);
          await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);
        } else {
          Alert.alert('Login Failed', 'Token not received from server.');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Invalid credentials or server error.' }));
        Alert.alert('Login Failed', errorData.message);
      }
    } catch (error) {
      console.error('Login API call failed:', error);
      Alert.alert('Login Error', 'An unexpected error occurred.');
    }
  };

  const signOut = async () => {
    try {
      // Use apiFetch to automatically include the Authorization header
      const response = await apiFetch('/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('User logged out successfully from server');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server logout failed:', errorData.message);
      }
    } catch (error) {
      // apiFetch can throw an error if token refresh fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local tokens and state on logout
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, signIn, signOut, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
