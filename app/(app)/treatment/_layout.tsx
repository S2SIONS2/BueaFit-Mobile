import { Stack } from 'expo-router';

export default function TreatmentStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: '' }} />
      <Stack.Screen name="add" options={{ title: '시술 추가' }} />
      <Stack.Screen name="detail/[id]" options={{ title: '시술 상세 및 수정' }} />
    </Stack>
  );
}
