import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation';
import { useSyncStore } from '@/stores';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // Initialize sync store for network monitoring
  useEffect(() => {
    const unsubscribe = useSyncStore.getState().initialize();
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
