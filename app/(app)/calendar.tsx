import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { apiFetch } from '@/src/api/apiClient';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, Mode } from 'react-native-big-calendar';

const events = [
  {
    title: '회의',
    start: new Date(2025, 8, 1, 10, 0),
    end: new Date(2025, 8, 1, 11, 0),
  },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('month'); // 기본은 month
  const router = useRouter();

  // 오늘 날짜로 이동
  const goToToday = () => {
    // react-native-big-calendar는 오늘로 이동하는 API를 제공하지 않음
    // 따라서 mode 변경을 통해 간접적으로 오늘 날짜를 표시
    setMode('day');
    // setTimeout(() => setMode('month'), 0); // 다시 month로 변경
  };

  // 예약 내역 조회
  const fetchScheduleList = async () => {
    try {
      const res = await apiFetch('/treatments', {
        method: "GET"
      })
      const data = await res.json();

      if(res.status === 200){
        console.log(data.items);
      }
    }catch(e){
      console.error(e);
    }
  }

  useEffect(() => {
    fetchScheduleList();
  }, [])

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.flex, { marginBottom: 10, justifyContent: 'flex-end' }]}>
        {/* 예약 추가 버튼 */}
        {/* <TouchableOpacity>
          <Text>
            + 예약 추가
          </Text>
        </TouchableOpacity> */}
        
        {/* 모드 선택 버튼 영역 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={goToToday} style={styles.button}>
            <Text>
              오늘
            </Text>
          </TouchableOpacity>
          {(['month', 'week', 'day'] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.button, mode === m && styles.activeButton]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.buttonText, mode === m && styles.activeButtonText]}>
                {m === 'day' ? '일' : m === 'week' ? '주' : '월'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 달력 */}
      <Calendar
        events={events}
        height={600}
        mode={mode}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/booking')}>
        <FontAwesomeIcon icon={faPlus as any} size={24} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 16, backgroundColor: '#fff'
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  activeButton: {
    backgroundColor: '#111',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  activeButtonText: {
    color: '#fff',
  },
  fab: { position: 'absolute', width: 56, height: 56, zIndex:999, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 100, backgroundColor: Colors.light.tint, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
