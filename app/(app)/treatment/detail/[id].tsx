import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { apiFetch } from '@/src/api/apiClient';
import { faPen, faPlus, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Interfaces
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

export default function TreatmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // States
  const [menu, setMenu] = useState<TreatmentMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  // New Detail Form States
  const [newDetailName, setNewDetailName] = useState('');
  const [newDetailDuration, setNewDetailDuration] = useState('');
  const [newDetailPrice, setNewDetailPrice] = useState('');

  // Data Fetching
  const fetchMenuDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/treatment-menus`);
      if (res.ok) {
        const data = await res.json();
        const menuItem = data.items.find((item: TreatmentMenu) => item.id.toString() === id);
        if (menuItem) {
          setMenu(menuItem);
          setMenuName(menuItem.name);
        } else {
          throw new Error('Treatment menu not found');
        }
      } else {
        throw new Error('Failed to fetch treatment menus');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMenuDetails();
  }, [fetchMenuDetails]);

  // --- API Handlers (Placeholders) ---
  const handleUpdateMenuName = async () => {
    Alert.alert('저장', `메뉴 이름 저장 기능 구현 필요: ${menuName}`);
    // TODO: Implement PUT /treatment-menus/${id} with { name: menuName }
    setIsEditingName(false);
    if(menu) setMenu({...menu, name: menuName});
  };

  const handleAddDetail = () => {
    Alert.alert('추가', `상세 항목 추가 기능 구현 필요: ${newDetailName}`);
    // TODO: Implement POST /treatment-menus/${id}/details with new detail data
    setModalVisible(false);
    // For now, just refresh from server
    fetchMenuDetails();
  };

  const handleDeleteDetail = (detailId: number) => {
    Alert.alert('삭제', `상세 항목(ID: ${detailId}) 삭제 기능 구현 필요`);
    // TODO: Implement DELETE /treatment-menus/${menu?.id}/details/${detailId}
  };

  // --- Render Functions ---
  const renderDetailItem = ({ item }: { item: TreatmentDetail }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailInfoContainer}>
        <ThemedText style={styles.detailName}>{item.name}</ThemedText>
        <ThemedText style={styles.detailInfo}>
          {item.duration_min}분 / {item.base_price.toLocaleString()}원
        </ThemedText>
      </View>
      <View style={styles.detailActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('수정', `상세 항목(ID: ${item.id}) 수정 기능 구현 필요`)}>
          <FontAwesomeIcon icon={faPen as any} size={16} color={Colors.light.tint} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteDetail(item.id)}>
          <FontAwesomeIcon icon={faTrash as any} size={16} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ThemedView style={styles.centerScreen}><ActivityIndicator size="large" /></ThemedView>;
  }

  if (!menu) {
    return <ThemedView style={styles.centerScreen}><ThemedText>메뉴 정보를 찾을 수 없습니다.</ThemedText></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      {/* --- Header: Menu Name Edit --- */}
      <View style={styles.header}>
        {isEditingName ? (
          <TextInput
            value={menuName}
            onChangeText={setMenuName}
            style={[styles.title, styles.titleInput]}
            autoFocus
          />
        ) : (
          <ThemedText type="title" style={styles.title}>{menu.name}</ThemedText>
        )}
        <TouchableOpacity onPress={() => isEditingName ? handleUpdateMenuName() : setIsEditingName(true)}>
          <FontAwesomeIcon icon={isEditingName as any ? faSave as any : faPen} size={20} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>

      {/* --- Details List --- */}
      <FlatList
        data={menu.details}
        renderItem={renderDetailItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<ThemedText style={styles.listHeader}>상세 시술 항목</ThemedText>}
        ListEmptyComponent={<ThemedText style={styles.noDetailsText}>등록된 항목이 없습니다.</ThemedText>}
      />

      {/* --- Add Detail Button --- */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <FontAwesomeIcon icon={faPlus as any} size={22} color="white" />
      </TouchableOpacity>

      {/* --- Add Detail Modal --- */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalView} onPress={() => {}}>
            <ThemedText type="title" style={styles.modalTitle}>새 상세 항목 추가</ThemedText>
            <TextInput style={styles.input} placeholder="항목 이름" value={newDetailName} onChangeText={setNewDetailName} />
            <TextInput style={styles.input} placeholder="소요 시간 (분)" value={newDetailDuration} onChangeText={setNewDetailDuration} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="가격 (원)" value={newDetailPrice} onChangeText={setNewDetailPrice} keyboardType="numeric" />
            <TouchableOpacity style={styles.button} onPress={handleAddDetail}>
              <ThemedText style={styles.buttonText}>추가</ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 10 },
  titleInput: { borderBottomWidth: 1, borderColor: Colors.light.tint },
  listHeader: { paddingHorizontal: 20, paddingVertical: 10, fontSize: 16, color: '#666', fontWeight: '600' },
  noDetailsText: { textAlign: 'center', marginTop: 20, color: '#999' },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  detailInfoContainer: { flex: 1 },
  detailName: { fontSize: 16, fontWeight: 'bold' },
  detailInfo: { fontSize: 14, color: '#888', marginTop: 4 },
  detailActions: { flexDirection: 'row' },
  actionButton: { padding: 8, marginLeft: 10 },
  fab: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.light.tint, justifyContent: 'center', alignItems: 'center', right: 20, bottom: 20, elevation: 8 },
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', backgroundColor: 'white', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', height: 50, backgroundColor: '#f0f2f5', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15 },
  button: { backgroundColor: Colors.light.tint, padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
