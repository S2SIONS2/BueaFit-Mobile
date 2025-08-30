'use client';

import PickerModal from "@/components/PickerModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { apiFetch } from "@/src/api/apiClient";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";

type Group = {
    name: string;
    id: number;
};

export default function Page() {
    const [menu, setMenu] = useState(""); // 시술 메뉴
    const [menuId, setMenuId] = useState<number | null>(null); // 시술 메뉴 ID
    const [name, setName] = useState(""); // 시술 이름
    const [hour, setHour] = useState(0); // 시술 시간 - 시
    const [minute, setMinute] = useState(0); // 시술 시간 - 분
    const time = hour + minute // 시술 시간
    const [price, setPrice] = useState(""); // 시술 가격
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hourOption = [
        { value: 0, label: "0시간" }, { value: 60, label: "1시간" }, { value: 120, label: "2시간" },
        { value: 180, label: "3시간" }, { value: 240, label: "4시간" }, { value: 300, label: "5시간" },
        { value: 360, label: "6시간" }, { value: 420, label: "7시간" }, { value: 480, label: "8시간" }
    ];

    const minuteOption = [
        { value: 0, label: "0분" }, { value: 30, label: "30분" },
    ];

    const [picker, setPicker] = useState<{
        visible: boolean;
        title: string;
        options: { value: number; label: string; }[];
        onSelect: (value: number) => void;
    }>({ visible: false, title: '', options: [], onSelect: () => {} });

    const nameRef = useRef<TextInput>(null);
    const menuRef = useRef<TextInput>(null);
    const priceRef = useRef<TextInput>(null);
    const isSubmittingRef = useRef(false);

    const router = useRouter();

    const [menuList, setMenuList] = useState<Group[]>([]);

    const searchMenu = async () => {
        try {
            const res = await apiFetch(`/treatment-menus`);
            const data = await res.json();
            const items = data.items.map((item: any) => ({ name: item.name, id: item.id }));
            setMenuList(items);
            return items;
        } catch (e) {
            console.error("Failed to fetch menu list", e);
            Alert.alert("오류", "메뉴 목록을 불러오는 데 실패했습니다.");
            return [];
        }
    }

    const handlePickerOpen = async (type: 'hour' | 'minute' | 'menu') => {
        Keyboard.dismiss();

        if (type === 'hour') {
            setPicker({
                visible: true,
                title: '시간 선택',
                options: hourOption,
                onSelect: setHour,
            });
        } else if (type === 'minute') {
            setPicker({
                visible: true,
                title: '분 선택',
                options: minuteOption,
                onSelect: setMinute,
            });
        } else if (type === 'menu') {
            let list = menuList;
            if (list.length === 0) {
                list = await searchMenu();
            }
            setPicker({
                visible: true,
                title: '시술 메뉴 선택',
                options: list.map(item => ({ value: item.id, label: item.name })),
                onSelect: (id) => {
                    const selected = list.find(item => item.id === id);
                    if (selected) {
                        setMenu(selected.name);
                        setMenuId(selected.id);
                    }
                },
            });
        }
    };

    const handlePickerClose = () => {
        setPicker(prev => ({ ...prev, visible: false }));
    }

    const newTreatment = async () => {
        if (isSubmittingRef.current) return;

        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            if (menu === "") {
                menuRef.current?.focus();
                return;
            }

            let resolvedMenuId = menuId;

            if (!resolvedMenuId) {
                const existing = menuList.find((item) => item.name === menu);

                if (existing) {
                    resolvedMenuId = existing.id;
                } else {
                    const response = await apiFetch(`/treatment-menus`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: menu }),
                    });

                    if (response.status === 201) {
                        const res = await response.json();
                        resolvedMenuId = res.id;
                    } else if (response.status === 409 || response.status === 422) {
                        const errorMsg = await response.json();
                        Alert.alert("오류", errorMsg.detail[0]?.message || "시술 메뉴 등록 오류");
                        return;
                    } else {
                        Alert.alert("오류", "시술 메뉴 생성 중 오류가 발생했습니다.");
                        return;
                    }
                }
            }

            if (name === "") {
                nameRef.current?.focus();
                return;
            }
            if (time === 0) {
                Alert.alert("오류", "시술 소요 시간을 선택해주세요.");
                return;
            }
            if (price === "") {
                priceRef.current?.focus();
                return;
            }

            const res = await apiFetch(`/treatment-menus/${resolvedMenuId}/details`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    duration_min: time,
                    base_price: price,
                }),
            });

            if (res.status === 201) {
                router.push("/(app)/treatment");
            } else {
                const err = await res.json();
                Alert.alert("오류", err.detail?.[0]?.message || "시술 등록 실패");
            }

        } catch (e) {
            console.error(e);
            Alert.alert("오류", "시술 등록 중 오류가 발생했습니다.");
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if(name === "" && menu === "" && time === 0 && price === "" ) {
            router.push('/(app)/treatment');
        } else {
            Alert.alert(
                "취소",
                "작성된 정보가 있습니다. 정말 취소하시겠습니까?",
                [
                    { text: "아니요", style: "cancel" },
                    { text: "예", onPress: () => router.push('/(app)/treatment') }
                ]
            );
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex1}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ThemedView style={styles.flex1}>
                <PickerModal
                    visible={picker.visible}
                    title={picker.title}
                    options={picker.options}
                    onClose={handlePickerClose}
                    onSelect={picker.onSelect}
                />
                {/* {showMenuList && (
                    <Pressable style={styles.fullScreenPressable} onPress={() => setShowmenuList(false)} />
                )} */}
                <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContentContainer}>
                    <Pressable onPress={() => Keyboard.dismiss()}>
                        <View style={styles.container}>
                            <ThemedText style={styles.headerSubtitle}>시술 정보를 입력하여 메뉴에 추가하세요.</ThemedText>

                            <View style={styles.formContainer}>
                                {/* 시술 메뉴 */}
                                <View>
                                    <ThemedText style={styles.label}>시술 메뉴 *</ThemedText>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            placeholder="예: 속눈썹 펌"
                                            style={styles.textInputCombobox}
                                            value={menu}
                                            onChangeText={(text) => {
                                                setMenu(text);
                                                setMenuId(null);
                                            }}
                                        />
                                        <TouchableOpacity onPress={() => handlePickerOpen('menu')} style={styles.chevronButton}>
                                            <FontAwesomeIcon icon={faChevronDown as any} size={14} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* 시술 이름 */}
                                <View>
                                    <ThemedText style={styles.label}>시술 이름 *</ThemedText>
                                    <TextInput
                                        placeholder="예: 클리닉 펌"
                                        style={styles.textInput}
                                        value={name}
                                        onChangeText={setName}
                                        ref={nameRef}
                                    />
                                </View>

                                {/* 시술 소요 시간 */}
                                <View style={styles.zIndex20}>
                                    <ThemedText style={styles.label}>시술 소요 시간 *</ThemedText>
                                    <View style={styles.timePickerContainer}>
                                        <View style={styles.flex1}>
                                            <TouchableOpacity onPress={() => handlePickerOpen('hour')} style={styles.timePickerButton}>
                                                <Text style={styles.textBase}>{hourOption.find(h => h.value === hour)?.label || '0시간'}</Text>
                                                <FontAwesomeIcon icon={faChevronDown as any} size={14} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.flex1}>
                                            <TouchableOpacity onPress={() => handlePickerOpen('minute')} style={styles.timePickerButton}>
                                                <Text style={styles.textBase}>{minuteOption.find(m => m.value === minute)?.label || '0분'}</Text>
                                                <FontAwesomeIcon icon={faChevronDown as any} size={14} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* 가격 */}
                                <View>
                                    <ThemedText style={styles.label}>가격 *</ThemedText>
                                    <TextInput
                                        placeholder="20000"
                                        style={styles.textInput}
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                        ref={priceRef}
                                    />
                                </View>
                            </View>
                        </View>
                    </Pressable>
                </ScrollView>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={newTreatment} style={[styles.submitButton, isSubmitting && styles.disabledButton]} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ThemedText style={styles.submitButtonText}>추가하기</ThemedText>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.cancelButton, { backgroundColor: '#ddd' }]} onPress={() => handleCancel()}>
                        <ThemedText style={[styles.cancelButtonText, { color: '#000' }]}>등록 취소</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    fullScreenPressable: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 10,
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
    container: {
        padding: 24,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
    },
    formContainer: {
        gap: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
    },
    textInputCombobox: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    chevronButton: {
        paddingLeft: 12,
    },
    textInput: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
    },
    zIndex20: {
        zIndex: 20,
    },
    timePickerContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    timePickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    textBase: {
        fontSize: 16,
    },
    pickerListContainer: {
        position: 'absolute',
        zIndex: 10,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        maxHeight: 240,
    },
    pickerListItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    pickerListItemText: {
        textAlign: 'center',
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 'auto',
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        backgroundColor: 'white',
        marginBottom: 72
    },
    submitButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.tint
    },
    disabledButton: {
        backgroundColor: '#A9A9A9', // A gray color to indicate disabled state
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: '#6B7280',
        fontWeight: '500',
    },
});
