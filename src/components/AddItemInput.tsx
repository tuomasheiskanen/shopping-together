import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface AddItemInputProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading?: boolean;
}

export function AddItemInput({
  onSubmit,
  isLoading = false,
}: AddItemInputProps): React.JSX.Element {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    setText('');
    await onSubmit(trimmedText);
    // Keep keyboard open for adding multiple items
    inputRef.current?.focus();
  };

  const handleSubmitEditing = () => {
    handleSubmit();
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Add an item..."
        placeholderTextColor="#999"
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSubmitEditing}
        editable={!isLoading}
        returnKeyType="done"
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[
          styles.addButton,
          (!text.trim() || isLoading) && styles.addButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!text.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View style={styles.plusIcon}>
            <View style={styles.plusHorizontal} />
            <View style={styles.plusVertical} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  plusIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  plusVertical: {
    position: 'absolute',
    width: 2,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
});
