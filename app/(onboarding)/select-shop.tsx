import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { apiFetch } from '@/src/api/apiClient';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';

interface Shop {
  id: string;
  name: string;
}

export default function SelectShopScreen() {
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await apiFetch('/shops');
        const data = await res.json();

        if (res.ok) {
          if (data.items && data.items.length === 0) {
            router.replace('/set-store');
          } else {
            setShops(data.items);
          }
        } else {
          throw new Error(data.message || 'Failed to fetch shops');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        Alert.alert('Error', `Failed to load shops: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [router]);

  const handleSelectShop = async (shopId: string) => {
    try {
      const res = await apiFetch('/shops/selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shop_id: shopId }),
      });

      if (res.ok) {
        router.replace('/(app)');
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to select the shop.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      Alert.alert('Error', `Failed to select shop: ${errorMessage}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          관리하실 가게를 선택해주세요.
        </ThemedText>
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.tint} />
        ) : (
          <View style={styles.listContainer}>
            {shops.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopButton}
                onPress={() => handleSelectShop(shop.id)}
              >
                <ThemedText style={styles.shopButtonText}>{shop.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  },
  content: {
    margin: 20,
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
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
  },
  shopButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
