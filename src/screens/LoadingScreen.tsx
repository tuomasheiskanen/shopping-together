import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores';
import type { LoadingScreenProps } from '@/navigation/types';

export function LoadingScreen({ navigation }: LoadingScreenProps): React.JSX.Element {
  const { isInitialized, user, initialize, signIn } = useAuthStore();

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) return;

    if (user) {
      // User is signed in, go to home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      // No user, sign in anonymously
      signIn().then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      });
    }
  }, [isInitialized, user, navigation, signIn]);

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
  },
});
