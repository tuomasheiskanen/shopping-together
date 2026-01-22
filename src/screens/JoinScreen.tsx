import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore, useListStore } from '@/stores';
import type { JoinScreenProps } from '@/navigation/types';

export function JoinScreen({ route, navigation }: JoinScreenProps): React.JSX.Element {
  const { token } = route.params;
  const { isInitialized, user, signIn } = useAuthStore();
  const { loadListByToken, joinList, currentList, error, clearError } =
    useListStore();
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    async function handleJoin() {
      // Wait for auth to be initialized
      if (!isInitialized) {
        setStatus('Initializing...');
        return;
      }

      // Sign in if not authenticated
      if (!user) {
        setStatus('Signing in...');
        await signIn();
        return;
      }

      // Look up list by token
      setStatus('Finding list...');
      await loadListByToken(token);
    }

    handleJoin();
  }, [isInitialized, user, token, signIn, loadListByToken]);

  useEffect(() => {
    async function joinAndNavigate() {
      if (!currentList || !user) return;

      // Join the list
      setStatus('Joining list...');
      await joinList(currentList.id);

      // Navigate to the list
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'List', params: { listId: currentList.id } }],
      });
    }

    if (currentList && user) {
      joinAndNavigate();
    }
  }, [currentList, user, joinList, navigation]);

  useEffect(() => {
    if (error) {
      // Navigate to home with error
      clearError();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [error, clearError, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  status: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
