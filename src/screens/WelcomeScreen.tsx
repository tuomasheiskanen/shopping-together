import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WelcomeScreenProps } from '@/navigation/types';

const COLORS = {
  coral: '#F5A998',
  coralLight: '#FDF5F3',
  headlineText: '#333',
  subtitleText: '#666',
  white: '#FFFFFF',
  buttonBorder: '#E8E8E8',
};

export function WelcomeScreen({ navigation }: WelcomeScreenProps): React.JSX.Element {
  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserOnboard' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient background overlay */}
      <View style={styles.gradientOverlay} />

      {/* Logo and App Name */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🛒</Text>
          <Text style={styles.logoText}>ShoppingTogether</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineSerif}>Shopping is</Text>
          <Text style={styles.headlineSerif}>better</Text>
          <Text style={styles.headlineScript}>together.</Text>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            The gentlest way to coordinate lists
          </Text>
          <Text style={styles.subtitle}>
            for parties, trips, and everyday life.
          </Text>
          <View style={styles.freeTextContainer}>
            <Text style={styles.freeText}>it's free!</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headlineSerif: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.headlineText,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
    }),
    textAlign: 'center',
    lineHeight: 52,
  },
  headlineScript: {
    fontSize: 48,
    color: COLORS.coral,
    fontFamily: 'DancingScript-Bold',
    textAlign: 'center',
    marginTop: -4,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.subtitleText,
    textAlign: 'center',
    lineHeight: 24,
  },
  freeTextContainer: {
    marginTop: 8,
    alignSelf: 'flex-end',
    marginRight: -16,
    transform: [{ rotate: '-5deg' }],
  },
  freeText: {
    fontSize: 20,
    color: COLORS.coral,
    fontFamily: 'DancingScript-Regular',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 32 : 16,
    gap: 12,
  },
  getStartedButton: {
    backgroundColor: COLORS.coral,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
