import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores';
import type { UserOnboardScreenProps } from '@/navigation/types';

const COLORS = {
  coral: '#F5A998',
  coralLight: '#FDF5F3',
  headlineText: '#333',
  subtitleText: '#666',
  white: '#FFFFFF',
  inputBackground: '#f5f5f5',
  disabledButton: '#ccc',
};

export function UserOnboardScreen({ navigation }: UserOnboardScreenProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setDisplayName } = useAuthStore();

  const isValid = name.trim().length > 0;

  const handleContinue = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await setDisplayName(trimmedName);
      await AsyncStorage.setItem('userName', trimmedName);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch {
      Alert.alert('Error', 'Could not save your name. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientOverlay} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🛒</Text>
            <Text style={styles.logoText}>SharedCart</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headlineSerif}>First, let's get to</Text>
            <Text style={styles.headlineScript}>know you.</Text>
          </View>

          {/* Input section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What should we call you?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Your name..."
              placeholderTextColor="#bbb"
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={isValid ? handleContinue : undefined}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
            {isValid && (
              <Text style={styles.niceToMeet}>nice to meet you</Text>
            )}
          </View>
        </View>

        {/* Bottom section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!isValid || isSubmitting}
          >
            <Text style={styles.continueButtonText}>
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: COLORS.coralLight,
    opacity: 0.5,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.headlineText,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headlineSerif: {
    fontSize: 38,
    fontWeight: '700',
    color: COLORS.headlineText,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
    }),
    textAlign: 'center',
    lineHeight: 48,
  },
  headlineScript: {
    fontSize: 48,
    color: COLORS.coral,
    fontFamily: 'DancingScript-Bold',
    textAlign: 'center',
    marginTop: -4,
  },
  inputSection: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 22,
    color: COLORS.coral,
    fontFamily: 'DancingScript-Regular',
    marginBottom: 16,
  },
  textInput: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.headlineText,
  },
  niceToMeet: {
    fontSize: 18,
    color: COLORS.coral,
    fontFamily: 'DancingScript-Regular',
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 32 : 16,
  },
  continueButton: {
    backgroundColor: COLORS.coral,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.disabledButton,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.subtitleText,
    textAlign: 'center',
    marginTop: 12,
  },
});
