import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores';
import type { LoadingScreenProps } from '@/navigation/types';

export function LoadingScreen({ navigation }: LoadingScreenProps): React.JSX.Element {
  const { isInitialized, user, error, initialize, signIn, clearError } = useAuthStore();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) return;

    const navigateAfterAuth = async () => {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      const targetScreen = hasSeenWelcome === 'true' ? 'Home' : 'Welcome';

      navigation.reset({
        index: 0,
        routes: [{ name: targetScreen }],
      });
    };

    if (user) {
      // User is signed in, check if they've seen welcome
      navigateAfterAuth();
    } else if (!error && !signingIn) {
      // No user and no error, sign in anonymously
      setSigningIn(true);
      signIn()
        .then(() => {
          navigateAfterAuth();
        })
        .catch(() => {
          setSigningIn(false);
        });
    }
  }, [isInitialized, user, error, signingIn, navigation, signIn]);

  const handleRetry = async () => {
    clearError();
    setSigningIn(true);
    try {
      await signIn();
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      const targetScreen = hasSeenWelcome === 'true' ? 'Home' : 'Welcome';
      navigation.reset({
        index: 0,
        routes: [{ name: targetScreen }],
      });
    } catch {
      setSigningIn(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
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
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
