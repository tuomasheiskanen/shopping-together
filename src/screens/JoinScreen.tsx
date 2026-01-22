import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuthStore, useListStore } from '@/stores';
import type { JoinScreenProps } from '@/navigation/types';

export function JoinScreen({ route, navigation }: JoinScreenProps): React.JSX.Element {
  const { token } = route.params;
  const { isInitialized, user, signIn, error: authError } = useAuthStore();
  const {
    loadListByToken,
    joinList,
    currentList,
    error: listError,
    isLoading,
    clearError,
  } = useListStore();
  const [status, setStatus] = useState('Initializing...');
  const [joinedListId, setJoinedListId] = useState<string | null>(null);

  const error = authError || listError;

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
      if (!currentList || !user || joinedListId) return;

      // Join the list
      setStatus('Joining list...');
      await joinList(currentList.id);
      setJoinedListId(currentList.id);

      // Navigate to the list
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'List', params: { listId: currentList.id } },
        ],
      });
    }

    if (currentList && user && !joinedListId) {
      joinAndNavigate();
    }
  }, [currentList, user, joinList, navigation, joinedListId]);

  const handleGoHome = () => {
    clearError();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleRetry = () => {
    clearError();
    setStatus('Finding list...');
    loadListByToken(token);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Could not join list</Text>
        <Text style={styles.errorMessage}>
          {listError || 'The invite link may be invalid or expired.'}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={handleRetry}
            disabled={isLoading}
          >
            <Text style={styles.retryButtonText}>
              {isLoading ? 'Retrying...' : 'Try Again'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={handleGoHome}
          >
            <Text style={styles.homeButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
    paddingHorizontal: 24,
  },
  status: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  homeButton: {
    backgroundColor: '#f5f5f5',
  },
  homeButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});
