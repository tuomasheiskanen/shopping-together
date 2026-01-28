import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  coral: '#F5A998',
  white: '#FFFFFF',
  headlineText: '#333',
  subtitleText: '#666',
  inputBorder: '#E8E8E8',
  inputBackground: '#f5f5f5',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreateListModal({
  visible,
  onClose,
  onCreate,
  isLoading = false,
}: CreateListModalProps): React.JSX.Element {
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setName('');
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!name.trim() || isLoading) return;
    await onCreate(name.trim());
    setName('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handle} />

          <Text style={styles.title}>Create New List</Text>
          <Text style={styles.subtitle}>
            Give your list a name to get started
          </Text>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="List name (e.g., Birthday Bash)"
            placeholderTextColor={COLORS.subtitleText}
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleCreate}
            autoCapitalize="words"
            editable={!isLoading}
            returnKeyType="done"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, !name.trim() && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={!name.trim() || isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.headlineText,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subtitleText,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.headlineText,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: COLORS.inputBackground,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.subtitleText,
  },
  createButton: {
    flex: 1,
    backgroundColor: COLORS.coral,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
