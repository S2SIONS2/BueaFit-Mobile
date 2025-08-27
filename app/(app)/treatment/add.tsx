import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function AddTreatmentScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">시술 추가</ThemedText>
      <ThemedText>이곳에 새로운 시술 메뉴와 상세 항목을 추가하는 폼을 구현할 수 있습니다.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
