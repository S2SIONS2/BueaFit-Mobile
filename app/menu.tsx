import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { Button, StyleSheet, View } from 'react-native';

export default function MenuScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Menu</ThemedText>
      <View style={styles.separator} />
      
      {/* Add navigation links here */}
      <ThemedText style={styles.link}>Profile</ThemedText>
      <ThemedText style={styles.link}>Settings</ThemedText>
      <ThemedText style={styles.link}>About</ThemedText>

      <View style={styles.separator} />
      
      <Button title="Close" onPress={() => router.back()} />
      <Button title="로그아웃" onPress={signOut} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#eee'
  },
  link: {
    fontSize: 18,
    marginVertical: 10,
  }
});
