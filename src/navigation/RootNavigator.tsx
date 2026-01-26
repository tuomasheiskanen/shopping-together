import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Placeholder screens - will be replaced with actual implementations
import { LoadingScreen } from '@/screens/LoadingScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ListScreen } from '@/screens/ListScreen';
import { JoinScreen } from '@/screens/JoinScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Deep linking configuration
 * Maps URLs to screens
 */
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'shoppingtogether://',
    'https://shoppingtogether.app',
    'http://shoppingtogether.app',
  ],
  config: {
    screens: {
      // Deep link: shoppingtogether://join/{token}
      Join: {
        path: 'join/:token',
        parse: {
          token: (token: string) => token,
        },
      },
      // Default screens (not directly accessible via deep link)
      Loading: '',
      Home: 'home',
      List: 'list/:listId',
    },
  },
};

export function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{
            // Prevent going back to loading screen
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            // Prevent going back to welcome screen
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            // Prevent going back from home
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="List"
          component={ListScreen}
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="Join"
          component={JoinScreen}
          options={{
            // This screen handles the deep link, then redirects
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
