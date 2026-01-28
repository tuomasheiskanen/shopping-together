import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddItemModal } from './AddItemModal';

interface AddItemInputProps {
  onSubmit: (text: string) => Promise<void>;
}

export function AddItemInput({ onSubmit }: AddItemInputProps): React.JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <AddItemModal
        visible={showModal}
        onSubmit={onSubmit}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5A998',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
