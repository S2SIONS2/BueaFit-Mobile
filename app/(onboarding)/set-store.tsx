import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { apiFetch } from '@/src/api/apiClient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StoreRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  // Form state
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await apiFetch('/shops');
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setStep(3); // If shops exist, go directly to the form
        } else {
          setStep(1); // Otherwise, start the intro flow
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to check store status.');
      } finally {
        setLoading(false);
      }
    };
    fetchStoreInfo();
  }, []);

  const checkRequired = () => {
    if (!storeName || !address) {
      Alert.alert('입력 오류', '가게 이름과 주소는 필수 항목입니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      const response = await apiFetch('/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName,
          address,
          address_detail: addressDetail,
          phone,
          business_number: businessNumber,
        }),
      });

      if (response.ok) {
        setStep(6);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register store');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      Alert.alert('등록 실패', errorMessage);
    }
  };

  const resetForm = () => {
    setStoreName('');
    setAddress('');
    setAddressDetail('');
    setPhone('');
    setBusinessNumber('');
    setStep(3); // Go back to the form
  }

  const renderContent = () => {
    // Main form for step 3
    if (step === 3) {
      return (
        <View style={styles.formContainer}>
          <ThemedText type="title" style={styles.formTitle}>가게 등록</ThemedText>
          <ThemedText style={styles.label}><ThemedText style={{color: 'red'}}>*</ThemedText> 가게 이름</ThemedText>
          <TextInput style={styles.input} placeholder="가게 이름" value={storeName} onChangeText={setStoreName} />
          
          <ThemedText style={styles.label}><ThemedText style={{color: 'red'}}>*</ThemedText> 가게 주소</ThemedText>
          <TextInput style={styles.input} placeholder="가게 주소" value={address} onChangeText={setAddress} />

          <TouchableOpacity style={styles.button} onPress={() => checkRequired() && setStep(4)}>
            <ThemedText style={styles.buttonText}>다음</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#ddd' }]} onPress={() => router.back()}>
            <ThemedText style={[styles.buttonText, { color: '#000' }]} onPress={() => setStep(3)}>등록 취소</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    // Other steps are rendered inside a modal
    return null;
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerScreen}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {renderContent()}

      <Modal visible={step !== 3} transparent={true} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { /* Prevent closing by accident */ }}>
          <View style={styles.modalView}>
            {step === 1 && (
              <>
                <ThemedText type="title" style={styles.modalTitle}>안녕하세요 사장님!</ThemedText>
                <ThemedText style={styles.modalText}>BueaFit 사용이 처음이시군요!</ThemedText>
                <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                  <ThemedText style={styles.buttonText}>다음</ThemedText>
                </TouchableOpacity>
              </>
            )}
            {step === 2 && (
              <>
                <ThemedText type="title" style={styles.modalTitle}>등록된 가게 정보가 없어요.</ThemedText>
                <ThemedText style={styles.modalText}>가게 등록을 위한 작성을 부탁드려요.</ThemedText>
                <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                  <ThemedText style={styles.buttonText}>작성하러 가기</ThemedText>
                </TouchableOpacity>
              </>
            )}
            {step === 4 && (
              <>
                <ThemedText type="title" style={styles.modalTitle}>아직 기록할 수 있는 정보가 남아있어요.</ThemedText>
                <ThemedText style={styles.modalText}>BueaFit의 원활한 사용을 위해 남겨주세요.</ThemedText>
                <TouchableOpacity style={styles.button} onPress={() => setStep(5)}>
                  <ThemedText style={styles.buttonText}>추가 등록하기</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSubmit}>
                  <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>건너뛰기</ThemedText>
                </TouchableOpacity>
              </>
            )}
            {step === 5 && (
              <View style={{width: '100%'}}>
                <ThemedText type="title" style={styles.modalTitle}>추가 정보 입력</ThemedText>
                <ThemedText style={styles.label}>상세 주소</ThemedText>
                <TextInput style={styles.input} placeholder="상세 주소" value={addressDetail} onChangeText={setAddressDetail} />
                <ThemedText style={styles.label}>전화번호</ThemedText>
                <TextInput style={styles.input} placeholder="전화번호" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <ThemedText style={styles.label}>사업자 등록번호</ThemedText>
                <TextInput style={styles.input} placeholder="사업자 등록번호" value={businessNumber} onChangeText={setBusinessNumber} />
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <ThemedText style={styles.buttonText}>등록</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#ccc' }]} onPress={() => setStep(3)}>
                  <ThemedText style={[styles.buttonText, { color: '#000' }]} onPress={() => setStep(3)}>취소</ThemedText>
                </TouchableOpacity>
              </View>
            )}
            {step === 6 && (
              <>
                <ThemedText type="title" style={styles.modalTitle}>가게 등록이 완료되었습니다!</ThemedText>
                <ThemedText style={styles.modalText}>BueaFit을 통해 가게를 관리해보세요!</ThemedText>
                <TouchableOpacity style={styles.button} onPress={() => router.replace('/(onboarding)/select-shop')}>
                  <ThemedText style={styles.buttonText}>확인</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={resetForm}>
                  <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>추가 등록하기</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#333',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
});
