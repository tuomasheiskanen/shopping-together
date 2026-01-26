import React, { useState } from 'react';
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

const COLORS = {
  coral: '#F5A998',
  white: '#FFFFFF',
  headlineText: '#333',
  subtitleText: '#666',
  inputBorder: '#E8E8E8',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

interface JoinListModalProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
  isLoading?: boolean;
}

export function JoinListModal({
  visible,
  onClose,
  onJoin,
  isLoading = false,
}: JoinListModalProps): React.JSX.Element {
  const [code, setCode] = useState('');

  const handleJoin = async () => {
    if (!code.trim() || isLoading) return;
    await onJoin(code.trim());
    setCode('');
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.container}>
          <Text style={styles.title}>Join a List</Text>
          <Text style={styles.subtitle}>
            Enter the share code to join an existing list
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter join code"
            placeholderTextColor={COLORS.subtitleText}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
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
              style={[styles.joinButton, !code.trim() && styles.buttonDisabled]}
              onPress={handleJoin}
              disabled={!code.trim() || isLoading}
            >
              <Text style={styles.joinButtonText}>
                {isLoading ? 'Joining...' : 'Join'}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 340,
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
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
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
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.headlineText,
  },
  joinButton: {
    flex: 1,
    backgroundColor: COLORS.coral,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
