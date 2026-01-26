import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AddItemModal } from './AddItemModal';

interface AddItemInputProps {
  onSubmit: (text: string) => Promise<void>;
}

export function AddItemInput({ onSubmit }: AddItemInputProps): React.JSX.Element {
  const [showModal, setShowModal] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ Add New Item</Text>
      </TouchableOpacity>

      <AddItemModal
        visible={showModal}
        onSubmit={onSubmit}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#333333',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
