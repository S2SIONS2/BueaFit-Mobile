import { apiFetch } from '@/src/api/apiClient';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SELECTED_SHOP_KEY = 'selectedShop';

interface Shop {
  id: string;
  name: string;
}

interface AuthContextType {
  token: string | null;
  selectedShop: Shop | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  selectShop: (shop: Shop) => Promise<void>;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        const storedShopString = await SecureStore.getItemAsync(SELECTED_SHOP_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
        if (storedShopString) {
          setSelectedShop(JSON.parse(storedShopString));
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadAuthData();
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

  const selectShop = async (shop: Shop) => {
    try {
      await SecureStore.setItemAsync(SELECTED_SHOP_KEY, JSON.stringify(shop));
      setSelectedShop(shop);
    } catch (e) {
      console.error('Failed to save selected shop', e);
      Alert.alert('Error', 'Could not save your shop selection.');
    }
  };

  const signOut = async () => {
    // Clear the state immediately for a responsive UI.
    setToken(null);
    setSelectedShop(null);

    try {
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
      console.error('Logout API call failed:', error);
    } finally {
      // Ensure all local session data is cleared.
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SELECTED_SHOP_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ token, selectedShop, signIn, signOut, selectShop, isLoaded }}>
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
