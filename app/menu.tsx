import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/src/context/AuthContext';
import { faCalendarDay, faChevronRight, faPlus, faRectangleList, faRightFromBracket, faSprayCan, faStore, faUserPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function MenuScreen() {
  const router = useRouter();
  const { signOut, selectedShop } = useAuth();

  const menuItems = [
    {
      title: '주요 기능',
      items: [
        { href: '/(app)', label: '금일 현황', icon: faRectangleList },
        { href: '/(app)/calendar', label: '예약 관리', icon: faCalendarDay },
        { href: '/(app)/customer', label: '고객 관리', icon: faUserPen },
        { href: '/(app)/treatment', label: '시술 메뉴 관리', icon: faSprayCan },
      ],
    },
    {
      title: '설정',
      items: [
        { href: '/(onboarding)/set-store', label: '가게 추가', icon: faPlus },
      ],
    },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Shop Context Section */}
      <TouchableOpacity style={styles.changeShopButton} onPress={() => router.push('/(onboarding)/select-shop')}>
        <ThemedText style={styles.changeShopButtonText}>가게 변경</ThemedText>
        <FontAwesomeIcon icon={faStore as any} size={16} color={Colors.light.tint} />
      </TouchableOpacity>
      <View style={styles.shopSection}>
        <View>
          <ThemedText style={styles.shopNameLabel}>현재 가게</ThemedText>
          <ThemedText type="title" style={styles.shopName}>{selectedShop?.name || '가게 선택 안됨'}</ThemedText>
        </View>
      </View>

      {/* Menu Sections */}
      {menuItems.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
          {section.items.map((item) => (
            <Link key={item.href} href={item.href as any} asChild>
              <Pressable>
                {({ pressed }) => (
                  <View style={[styles.menuItem, pressed && styles.menuItemPressed]}>
                    <FontAwesomeIcon icon={item.icon as any} size={20} color={Colors.light.text} style={styles.icon} />
                    <ThemedText style={styles.menuItemText}>{item.label}</ThemedText>
                    <FontAwesomeIcon icon={faChevronRight as any} size={16} color="#ccc" />
                  </View>
                )}
              </Pressable>
            </Link>
          ))}
        </View>
      ))}

      <View style={{flex: 1}} />

      {/* Logout Section */}
      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <FontAwesomeIcon icon={faRightFromBracket as import('@fortawesome/fontawesome-svg-core').IconProp} size={20} color={Colors.light.tint} style={styles.icon} />
        <ThemedText style={styles.logoutButtonText}>로그아웃</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  // Shop Section
  shopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  shopNameLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  shopName: {
    fontWeight: 'bold',
  },
  changeShopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#f0f2f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  changeShopButtonText: {
    color: Colors.light.tint,
    fontWeight: 'bold',
    marginRight: 8,
  },
  // Menu Section
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  menuItemPressed: {
    backgroundColor: '#fafafa',
  },
  icon: {
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  logoutButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '500',
  },
});
