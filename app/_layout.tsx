import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { event } from '../src/lib/event';
import { Alert } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { token, isLoaded, signOut } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = () => {
      Alert.alert(
        '세션 만료',
        '세션이 만료되었습니다. 다시 로그인해주세요.',
        [
          {
            text: '확인',
            onPress: () => {
              signOut();
              router.replace('/(auth)/login');
            },
          },
        ],
        { cancelable: false }
      );
    };

    event.on('sessionExpired', handleSessionExpired);

    return () => {
      event.off('sessionExpired', handleSessionExpired);
    };
  }, [router, signOut]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is signed in and the initial segment is not in the auth group.
    if (token && inAuthGroup) {
      // Redirect to the shop selection screen.
      router.replace('/(onboarding)/select-shop');
    } else if (!token && !inAuthGroup) {
      // Redirect to the login screen.
      router.replace('/(auth)/login');
    }
  }, [token, segments, isLoaded]);

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="menu" options={{ title: 'Menu' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
