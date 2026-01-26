import { create } from 'zustand';
import { List, CreateListInput, UpdateListInput, ListWithStats, Participant } from '@/types';
import * as listsService from '@/services/lists';
import * as participantsService from '@/services/participants';
import { useAuthStore } from './authStore';

interface ListState {
  currentList: List | null;
  userLists: ListWithStats[];
  participants: Participant[];
  isLoading: boolean;
  isLoadingLists: boolean;
  error: string | null;
}

interface ListActions {
  loadList: (listId: string) => () => void;
  loadListByToken: (token: string) => Promise<void>;
  createList: (input: CreateListInput) => Promise<string | null>;
  updateList: (data: UpdateListInput) => Promise<void>;
  deleteList: () => Promise<void>;
  regenerateLinkToken: () => Promise<string | null>;
  joinList: (listId: string) => Promise<void>;
  clearList: () => void;
  clearError: () => void;
  loadUserLists: () => Promise<void>;
  subscribeToUserLists: () => () => void;
  refreshUserLists: () => Promise<void>;
  subscribeToParticipants: (listId: string) => () => void;
}

type ListStore = ListState & ListActions;

export const useListStore = create<ListStore>((set, get) => ({
  // State
  currentList: null,
  userLists: [],
  participants: [],
  isLoading: false,
  isLoadingLists: false,
  error: null,

  // Actions
  loadList: (listId: string) => {
    set({ isLoading: true, error: null });

    // Subscribe to real-time updates
    const unsubscribe = listsService.subscribeToList(
      listId,
      (list) => {
        set({ currentList: list, isLoading: false });
      },
      (error) => {
        set({
          isLoading: false,
          error: error.message || 'Failed to load list',
        });
      },
    );

    return unsubscribe;
  },

  loadListByToken: async (token: string) => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const list = await listsService.getListByLinkToken(token);
      if (!list) {
        set({
          isLoading: false,
          error: 'List not found or link has expired',
        });
        return;
      }

      set({ currentList: list, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load list',
      });
    }
  },

  createList: async (input: CreateListInput) => {
    const { isLoading } = get();
    if (isLoading) return null;

    set({ isLoading: true, error: null });

    try {
      const list = await listsService.createList(input);
      set({ currentList: list, isLoading: false });
      return list.id;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create list',
      });
      return null;
    }
  },

  updateList: async (data: UpdateListInput) => {
    const { currentList, isLoading } = get();
    if (isLoading || !currentList) return;

    set({ error: null });

    try {
      await listsService.updateList(currentList.id, data);
      // Real-time listener will update the state
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update list',
      });
    }
  },

  deleteList: async () => {
    const { currentList, isLoading } = get();
    if (isLoading || !currentList) return;

    set({ isLoading: true, error: null });

    try {
      await listsService.deleteList(currentList.id);
      set({ currentList: null, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete list',
      });
    }
  },

  regenerateLinkToken: async () => {
    const { currentList, isLoading } = get();
    if (isLoading || !currentList) return null;

    set({ error: null });

    try {
      const newToken = await listsService.regenerateLinkToken(currentList.id);
      // Real-time listener will update the state
      return newToken;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to regenerate link',
      });
      return null;
    }
  },

  joinList: async (listId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'Must be signed in to join a list' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Check if already a participant
      const isAlreadyParticipant = await participantsService.isParticipant(
        listId,
        user.uid,
      );

      if (!isAlreadyParticipant) {
        await participantsService.addParticipant(
          listId,
          user.uid,
          user.isAnonymous ? 'anonymous' : 'account',
        );
      }

      // Load the list
      const list = await listsService.getList(listId);
      set({ currentList: list, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to join list',
      });
    }
  },

  clearList: () => {
    set({ currentList: null, participants: [], error: null });
  },

  clearError: () => {
    set({ error: null });
  },

  loadUserLists: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ userLists: [], isLoadingLists: false });
      return;
    }

    set({ isLoadingLists: true, error: null });

    try {
      const lists = await listsService.getUserLists(user.uid);
      set({ userLists: lists, isLoadingLists: false });
    } catch (error) {
      set({
        isLoadingLists: false,
        error: error instanceof Error ? error.message : 'Failed to load lists',
      });
    }
  },

  subscribeToUserLists: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ userLists: [], isLoadingLists: false });
      return () => {};
    }

    set({ isLoadingLists: true, error: null });

    const unsubscribe = listsService.subscribeToUserLists(
      user.uid,
      (lists) => {
        set({ userLists: lists, isLoadingLists: false });
      },
      (error) => {
        set({
          isLoadingLists: false,
          error: error.message || 'Failed to load lists',
        });
      },
    );

    return unsubscribe;
  },

  refreshUserLists: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const lists = await listsService.getUserLists(user.uid);
      set({ userLists: lists });
    } catch {
      // Silently fail on refresh
    }
  },

  subscribeToParticipants: (listId: string) => {
    const unsubscribe = participantsService.subscribeToParticipants(
      listId,
      (participants) => {
        set({ participants });
      },
      (error) => {
        console.warn('Failed to load participants:', error.message);
      },
    );

    return unsubscribe;
  },
}));
