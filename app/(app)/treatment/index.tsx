import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { apiFetch } from '@/src/api/apiClient';
import { faBars, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TreatmentDetail {
  id: number;
  name: string;
  duration_min: number;
  base_price: number;
}

interface TreatmentMenu {
  id: number;
  name: string;
  details: TreatmentDetail[];
}

const TreatmentCard = ({ item }: { item: TreatmentMenu }) => {
  const router = useRouter();

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}시간 ` : ''}${m > 0 ? `${m}분` : ''}`.trim();
  };

  const handleEditDetail = (detailId: number) => {
    Alert.alert('수정', `상세 항목(ID: ${detailId}) 수정 기능은 여기에 구현됩니다.`);
  };

  const handleDeleteDetail = (detailId: number) => {
    Alert.alert('삭제', `상세 항목(ID: ${detailId})을(를) 정말 삭제하시겠습니까?`);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => router.push(`/(app)/treatment/detail/${item.id}`)}>
        <View style={styles.cardHeader}>
          <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
          <FontAwesomeIcon icon={faBars as any} size={20} color="#aaa" />
        </View>
      </TouchableOpacity>

      <View style={styles.detailsContainer}>
        {item.details.length === 0 ? (
          <ThemedText style={styles.noDetailsText}>등록된 시술 항목이 없습니다.</ThemedText>
        ) : (
          item.details.map((detail) => (
            <View key={detail.id} style={styles.detailItem}>
              <View style={styles.detailInfoContainer}>
                <ThemedText style={styles.detailName}>{detail.name}</ThemedText>
                <ThemedText style={styles.detailInfo}>
                  소요 시간: {formatDuration(detail.duration_min)} / 가격: {detail.base_price.toLocaleString()}원
                </ThemedText>
              </View>
              <View style={styles.detailActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEditDetail(detail.id)}>
                  <FontAwesomeIcon icon={faPen as any} size={16} color={Colors.light.tint} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteDetail(detail.id)}>
                  <FontAwesomeIcon icon={faTrash as any} size={16} color="#ccc" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default function TreatmentScreen() {
  const router = useRouter();
  const [menu, setMenu] = useState<TreatmentMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        const res = await apiFetch('/treatment-menus');
        const data = await res.json();
        if (res.ok) {
          setMenu(data.items);
        } else {
          throw new Error(data.message || 'Failed to fetch treatment menus');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTreatment();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.centerScreen}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">시술 메뉴 관리</ThemedText>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(app)/treatment/add')}
        >
          <FontAwesomeIcon icon={faPlus as any} color="white" size={16} />
          <ThemedText style={styles.addButtonText}>시술 추가</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={menu}
        renderItem={({ item }) => <TreatmentCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f0f2f5',
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 15,
    paddingTop: 5,
  },
  noDetailsText: {
    color: '#999',
    fontStyle: 'italic',
    padding: 10,
    textAlign: 'center',
  },
  detailItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailInfoContainer: {
    flex: 1,
  },
  detailName: {
    fontWeight: '600',
    fontSize: 15,
  },
  detailInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  detailActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});
