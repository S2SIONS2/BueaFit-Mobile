
'use client';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { ThemedText } from './ThemedText';

interface PickerOption {
  value: number;
  label: string;
}

interface PickerModalProps {
  visible: boolean;
  options: PickerOption[];
  onClose: () => void;
  onSelect: (value: number) => void;
  title: string;
}

const PickerModal: React.FC<PickerModalProps> = ({ visible, options, onClose, onSelect, title }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.centeredView} onPress={onClose}>
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.modalView}>
                <View style={styles.header}>
                    <ThemedText style={styles.title}>{title}</ThemedText>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <FontAwesomeIcon icon={faTimes} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.value.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                onSelect(item.value);
                                onClose();
                            }}
                        >
                            <Text style={styles.optionText}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  safeArea: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    textAlign: 'center',
    fontSize: 18,
  },
});

export default PickerModal;
