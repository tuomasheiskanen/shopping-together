import { create } from 'zustand';
import { User } from '@/types';
import * as authService from '@/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  initialize: () => () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Actions
  initialize: () => {
    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChanged((user) => {
      set({
        user,
        isInitialized: true,
        isLoading: false,
      });
    });

    // Check for existing user
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      set({ user: currentUser, isInitialized: true });
    }

    return unsubscribe;
  },

  signIn: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const user = await authService.signInAnonymously();
      set({ user, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign in',
      });
    }
  },

  signOut: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      await authService.signOut();
      set({ user: null, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign out',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
