import { create } from 'zustand';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';

interface SyncState {
  isOnline: boolean;
  hasPendingWrites: boolean;
  lastSyncTime: Date | null;
  appState: AppStateStatus;
}

interface SyncActions {
  initialize: () => () => void;
  setOnline: (isOnline: boolean) => void;
  setPendingWrites: (hasPending: boolean) => void;
  updateLastSyncTime: () => void;
}

type SyncStore = SyncState & SyncActions;

export const useSyncStore = create<SyncStore>((set) => ({
  // State
  isOnline: true,
  hasPendingWrites: false,
  lastSyncTime: null,
  appState: 'active',

  // Actions
  initialize: () => {
    const subscriptions: (() => void)[] = [];

    // Network status listener
    const netInfoUnsubscribe = NetInfo.addEventListener(
      (state: NetInfoState) => {
        set({ isOnline: state.isConnected ?? true });
      },
    );
    subscriptions.push(netInfoUnsubscribe);

    // App state listener (for detecting when app goes to background)
    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        set({ appState: nextAppState });
      },
    );
    subscriptions.push(() => appStateSubscription.remove());

    // Firestore pending writes listener
    // Note: This requires setting up a snapshot listener on a document
    // For now, we'll track pending writes through the items store
    // A more robust solution would use Firestore's waitForPendingWrites()

    // Return cleanup function
    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  },

  setOnline: (isOnline: boolean) => {
    set({ isOnline });
  },

  setPendingWrites: (hasPending: boolean) => {
    set({ hasPendingWrites: hasPending });
    if (!hasPending) {
      set({ lastSyncTime: new Date() });
    }
  },

  updateLastSyncTime: () => {
    set({ lastSyncTime: new Date() });
  },
}));

/**
 * Check if Firestore has pending writes
 * This is an async operation that waits for pending writes to complete
 */
export async function waitForPendingWrites(): Promise<void> {
  await firestore().waitForPendingWrites();
  useSyncStore.getState().updateLastSyncTime();
}

/**
 * Get human-readable sync status
 */
export function getSyncStatusText(): string {
  const { isOnline, hasPendingWrites } = useSyncStore.getState();

  if (!isOnline) {
    return 'Offline';
  }

  if (hasPendingWrites) {
    return 'Syncing...';
  }

  return 'All changes saved';
}
