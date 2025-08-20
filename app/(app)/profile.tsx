import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiFetch } from '@/src/api/apiClient';
import React, { useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text } from 'react-native';

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchProfile = async () => {
    setLoading(true);
    setError(null);
    setProfileData(null);

    try {
      // This assumes your API has a '/users/me' endpoint for fetching user profiles.
      // Please change it if your endpoint is different.
      const response = await apiFetch('/users/me');

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch profile. Status: ${response.status}. ${errorText}`);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">API Test Page</ThemedText>
      <ThemedText style={styles.subtitle}>
        Press the button to make an authenticated API call to /users/me.
      </ThemedText>
      
      <Button title="Fetch My Profile" onPress={handleFetchProfile} disabled={loading} />

      {loading && <ActivityIndicator size="large" style={styles.loader} />} 

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      {profileData && (
        <ScrollView style={styles.resultContainer}>
          <ThemedText style={styles.resultTitle}>Success!</ThemedText>
          <Text style={styles.resultText}>
            {JSON.stringify(profileData, null, 2)}
          </Text>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    marginVertical: 15,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    marginVertical: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontFamily: 'SpaceMono',
    color: '#333',
  }
});
