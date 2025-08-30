import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { apiFetch } from '@/src/api/apiClient';
import { faPlus, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Type for a single customer item from the API
interface Customer {
  id: number;
  shop_id: number;
  group_name: string;
  name: string;
  phone_number: string;
  memo: string;
  created_at: string;
  updated_at: string;
}

// Type for the API response
interface PhonebookResponse {
  items: Customer[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export default function CustomerScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Add Form state
  const [addName, setAddName] = useState('');
  const [addPhoneNumber, setAddPhoneNumber] = useState('');
  const [addMemo, setAddMemo] = useState('');
  const [addGroupName, setAddGroupName] = useState('');

  // Edit Form state
  const [editName, setEditName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [editGroupName, setEditGroupName] = useState('');


  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/phonebooks');
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data: PhonebookResponse = await response.json();
      setCustomers(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAddNewCustomer = async () => {
    if (!addName || !addPhoneNumber) {
      Alert.alert('입력 오류', '이름과 전화번호는 필수 항목입니다.');
      return;
    }
    try {
      const response = await apiFetch('/phonebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: addName, 
          phone_number: addPhoneNumber, 
          memo: addMemo, 
          group_name: addGroupName || 'default' 
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '고객 추가에 실패했습니다.');
      }
      Alert.alert('성공', '고객이 성공적으로 추가되었습니다!');
      setAddName('');
      setAddPhoneNumber('');
      setAddMemo('');
      setAddGroupName('');
      setAddModalVisible(false);
      fetchCustomers();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
      Alert.alert('오류', `고객 추가 실패: ${errorMessage}`);
    }
  };

  // 고객 정보 수정
  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const response = await apiFetch(`/phonebooks/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone_number: editPhoneNumber,
          memo: editMemo,
          group_name: editGroupName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '고객 정보 수정에 실패했습니다.');
      }

      Alert.alert('성공', '고객 정보가 성공적으로 수정되었습니다!');
      setIsEditing(false);
      setDetailsModalVisible(false);
      fetchCustomers();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
      Alert.alert('오류', `고객 정보 수정 실패: ${errorMessage}`);
    }
  };
  
  const openDetailsModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditName(customer.name);
    setEditPhoneNumber(customer.phone_number);
    setEditMemo(customer.memo);
    setEditGroupName(customer.group_name);
    setDetailsModalVisible(true);
    setIsEditing(false);
  };

  const handleCloseDetailsModal = () => {
    if (isEditing) {
      Alert.alert(
        '수정 중인 정보가 있습니다',
        '정말 닫으시겠습니까? 변경사항이 저장되지 않습니다.',
        [
          { text: '아니오', style: 'cancel' },
          { text: '네', onPress: () => setDetailsModalVisible(false), style: 'destructive' },
        ]
      );
    } else {
      setDetailsModalVisible(false);
    }
  };

  const groupedCustomers = useMemo(() => {
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length === 0) return [];
    return filtered.reduce((acc, customer) => {
      const firstLetter = customer.name[0]?.toUpperCase() || '#';
      let group = acc.find(g => g.title === firstLetter);
      if (group) {
        group.data.push(customer);
      } else {
        acc.push({ title: firstLetter, data: [customer] });
      }
      return acc;
    }, [] as { title: string; data: Customer[] }[]).sort((a, b) => a.title.localeCompare(b.title));
  }, [customers, searchQuery]);

  if (loading && customers.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText>고객 정보를 불러오는 중...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ThemedText type="defaultSemiBold" style={{ color: 'red' }}>오류: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Add Customer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAddModalVisible(false)}>
          <Pressable style={styles.modalView} onPress={() => {}}>
            <ThemedText type="title" style={styles.modalTitle}>새 고객 추가</ThemedText>
            <TextInput style={styles.modalInput} placeholder="이름 *" value={addName} onChangeText={setAddName} />
            <TextInput style={styles.modalInput} placeholder="그룹명" value={addGroupName} onChangeText={setAddGroupName} />
            <TextInput style={styles.modalInput} placeholder="전화번호 *" value={addPhoneNumber} onChangeText={setAddPhoneNumber} keyboardType="phone-pad" />
            <TextInput style={[styles.modalInput, styles.memoInput]} placeholder="메모" value={addMemo} onChangeText={setAddMemo} multiline />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddNewCustomer}>
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={detailsModalVisible}
          onRequestClose={handleCloseDetailsModal}
        >
          <Pressable style={styles.modalOverlay} onPress={handleCloseDetailsModal}>
            <Pressable style={styles.modalView} onPress={() => {}}>
              {isEditing ? (
                <>
                  <ThemedText type="title" style={styles.modalTitle}>고객 정보 수정</ThemedText>
                  <TextInput style={styles.modalInput} placeholder="이름" value={editName} onChangeText={setEditName} />
                  <TextInput style={styles.modalInput} placeholder="전화번호" value={editPhoneNumber} onChangeText={setEditPhoneNumber} keyboardType="phone-pad" />
                  <TextInput style={styles.modalInput} placeholder="그룹" value={editGroupName} onChangeText={setEditGroupName} />
                  <TextInput style={[styles.modalInput, styles.memoInput]} placeholder="메모" value={editMemo} onChangeText={setEditMemo} multiline />
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsEditing(false)}>
                      <Text style={styles.buttonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdateCustomer}>
                      <Text style={styles.buttonText}>저장</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <ThemedText type="title" style={styles.modalTitle}>{selectedCustomer.name}</ThemedText>
                  <View style={styles.detailRow}><ThemedText style={styles.detailLabel}>전화번호:</ThemedText><ThemedText style={styles.detailValue}>{selectedCustomer.phone_number}</ThemedText></View>
                  <View style={styles.detailRow}><ThemedText style={styles.detailLabel}>그룹:</ThemedText><ThemedText style={styles.detailValue}>{selectedCustomer.group_name}</ThemedText></View>
                  <View style={styles.detailRow}><ThemedText style={styles.detailLabel}>메모:</ThemedText><ThemedText style={styles.detailValue}>{selectedCustomer.memo || ''}</ThemedText></View>
                  <View style={styles.modalButtonContainer}>
                     <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCloseDetailsModal}>
                        <Text style={styles.buttonText}>닫기</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={() => setIsEditing(true)}>
                       <Text style={styles.buttonText}>수정</Text>
                     </TouchableOpacity>
                  </View>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Main Screen Content */}
      <ThemedText type="title" style={styles.title}>고객 리스트</ThemedText>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="검색..." placeholderTextColor="#888" value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <SectionList
        sections={groupedCustomers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openDetailsModal(item)}>
            <View style={styles.itemContainer}>
              <FontAwesomeIcon icon={faUserCircle as any} size={40} color={Colors.light.icon} />
              <View style={styles.itemTextContainer}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemPhone}>{item.phone_number}</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <ThemedText style={styles.sectionHeader}>{title}</ThemedText>
        )}
        ListEmptyComponent={<View style={styles.center}><ThemedText>검색 결과가 없습니다.</ThemedText></View>}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <FontAwesomeIcon icon={faPlus as any} size={24} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, paddingHorizontal: 16 },
  title: { marginTop: 20, marginBottom: 10 },
  searchContainer: { paddingHorizontal: 8, marginBottom: 10 },
  searchInput: { height: 40, backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 12, fontSize: 16 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', backgroundColor: Colors.light.background, paddingVertical: 4, paddingHorizontal: 8 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  itemTextContainer: { marginLeft: 12 },
  itemName: { fontSize: 18, fontWeight: '500' },
  itemPhone: { fontSize: 14, color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#e0e0e0', marginLeft: 60 },
  fab: { position: 'absolute', width: 56, height: 56, zIndex:999, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 100, backgroundColor: Colors.light.tint, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalView: { width: '90%', margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { marginBottom: 20, textAlign: 'center' },
  modalInput: { width: '100%', height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  memoInput: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  modalButton: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, elevation: 2, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  saveButton: { backgroundColor: Colors.light.tint },
  cancelButton: { backgroundColor: '#A9A9A9' },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  // Detail Modal Styles
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  detailLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  detailValue: { fontSize: 16, color: '#555', flex: 1, textAlign: 'right' },
});