import { Stack, useRouter } from 'expo-router';
import { Button } from 'react-native';

export default function OnboardingLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen 
        name="select-shop" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="set-store" 
        options={{
          title: '가게 등록',
          headerRight: () => <Button title="메뉴" onPress={() => router.push('/menu')} />
        }}
      />
    </Stack>
  );
}
