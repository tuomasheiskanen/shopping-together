import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSyncStore } from '@/stores';

export function SyncStatusBar(): React.JSX.Element | null {
  const { isOnline, hasPendingWrites } = useSyncStore();

  if (isOnline && !hasPendingWrites) {
    return null;
  }

  const message = !isOnline
    ? 'Offline - changes will sync when connected'
    : 'Syncing changes...';

  const backgroundColor = !isOnline ? '#FF9500' : '#007AFF';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});
