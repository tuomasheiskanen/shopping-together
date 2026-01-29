import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddItemInputProps {
  onSubmit: (text: string) => Promise<void>;
}

export function AddItemInput({ onSubmit }: AddItemInputProps): React.JSX.Element {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const isValid = text.trim().length > 0;

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    setIsLoading(true);
    try {
      await onSubmit(trimmedText);
      setText('');
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Add new item..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          editable={!isLoading}
          returnKeyType="done"
          autoCapitalize="sentences"
        />
        <TouchableOpacity
          style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonIcon}>↑</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5A998',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
});
