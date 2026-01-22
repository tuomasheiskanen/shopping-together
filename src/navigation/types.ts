import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Root stack parameter list
 * Defines all screens and their parameters
 */
export type RootStackParamList = {
  // Loading screen shown during auth initialization
  Loading: undefined;

  // Home screen for creating/joining lists
  Home: undefined;

  // Shopping list screen
  List: {
    listId: string;
  };

  // Join list screen (deep link landing)
  Join: {
    token: string;
  };
};

/**
 * Screen props types for each screen
 */
export type LoadingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Loading'
>;

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export type ListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'List'
>;

export type JoinScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Join'
>;

/**
 * Declaration merging for useNavigation hook
 * Enables typed navigation throughout the app
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
