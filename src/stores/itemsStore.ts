import { create } from 'zustand';
import { Item, CreateItemInput, UpdateItemInput } from '@/types';
import * as itemsService from '@/services/items';

// Track pending operations for optimistic updates
interface PendingOperation {
  type: 'add' | 'update' | 'delete' | 'toggle';
  itemId: string;
  timestamp: number;
}

interface ItemsState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  pendingOperations: Map<string, PendingOperation>;
  listId: string | null;
}

interface ItemsActions {
  subscribeToItems: (listId: string) => () => void;
  addItem: (input: CreateItemInput) => Promise<void>;
  updateItem: (itemId: string, data: UpdateItemInput) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  toggleItem: (itemId: string) => Promise<void>;
  clearItems: () => void;
  clearError: () => void;
}

type ItemsStore = ItemsState & ItemsActions;

// Generate temporary ID for optimistic updates
function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useItemsStore = create<ItemsStore>((set, get) => ({
  // State
  items: [],
  isLoading: false,
  error: null,
  pendingOperations: new Map(),
  listId: null,

  // Actions
  subscribeToItems: (listId: string) => {
    set({ isLoading: true, error: null, listId });

    const unsubscribe = itemsService.subscribeToItems(
      listId,
      (items) => {
        const { pendingOperations } = get();

        // Filter out items that have pending delete operations
        const filteredItems = items.filter((item) => {
          const pending = pendingOperations.get(item.id);
          return !(pending && pending.type === 'delete');
        });

        set({ items: filteredItems, isLoading: false });
      },
      (error) => {
        set({
          isLoading: false,
          error: error.message || 'Failed to load items',
        });
      },
    );

    return unsubscribe;
  },

  addItem: async (input: CreateItemInput) => {
    const { listId, items, pendingOperations } = get();
    if (!listId) return;

    const tempId = generateTempId();

    // Optimistic update: add item immediately with temp ID
    const optimisticItem: Item = {
      id: tempId,
      text: input.text,
      quantity: input.quantity,
      completed: false,
      updatedAt: { toDate: () => new Date() } as any,
    };

    const newPendingOps = new Map(pendingOperations);
    newPendingOps.set(tempId, {
      type: 'add',
      itemId: tempId,
      timestamp: Date.now(),
    });

    set({
      items: [...items, optimisticItem],
      pendingOperations: newPendingOps,
      error: null,
    });

    try {
      await itemsService.addItem(listId, input);
      // Real-time listener will update with the actual item
      // Remove pending operation
      const updatedPendingOps = new Map(get().pendingOperations);
      updatedPendingOps.delete(tempId);
      set({ pendingOperations: updatedPendingOps });
    } catch (error) {
      // Rollback optimistic update
      const currentItems = get().items;
      const updatedPendingOps = new Map(get().pendingOperations);
      updatedPendingOps.delete(tempId);

      set({
        items: currentItems.filter((item) => item.id !== tempId),
        pendingOperations: updatedPendingOps,
        error: error instanceof Error ? error.message : 'Failed to add item',
      });
    }
  },

  updateItem: async (itemId: string, data: UpdateItemInput) => {
    const { listId, items, pendingOperations } = get();
    if (!listId) return;

    const itemIndex = items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    const originalItem = items[itemIndex];

    // Optimistic update
    const updatedItems = [...items];
    updatedItems[itemIndex] = { ...originalItem, ...data };

    const newPendingOps = new Map(pendingOperations);
    newPendingOps.set(itemId, {
      type: 'update',
      itemId,
      timestamp: Date.now(),
    });

    set({
      items: updatedItems,
      pendingOperations: newPendingOps,
      error: null,
    });

    try {
      await itemsService.updateItem(listId, itemId, data);
      // Real-time listener will confirm the update
      const updatedPendingOps = new Map(get().pendingOperations);
      updatedPendingOps.delete(itemId);
      set({ pendingOperations: updatedPendingOps });
    } catch (error) {
      // Rollback optimistic update
      const currentItems = get().items;
      const updatedPendingOps = new Map(get().pendingOperations);
      updatedPendingOps.delete(itemId);

      const rollbackItems = [...currentItems];
      const idx = rollbackItems.findIndex((item) => item.id === itemId);
      if (idx !== -1) {
        rollbackItems[idx] = originalItem;
      }

      set({
        items: rollbackItems,
        pendingOperations: updatedPendingOps,
        error: error instanceof Error ? error.message : 'Failed to update item',
      });
    }
  },

  deleteItem: async (itemId: string) => {
    const { listId, items, pendingOperations } = get();
    if (!listId) return;

    const itemIndex = items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    const originalItem = items[itemIndex];

    // Optimistic update: remove item immediately
    const newPendingOps = new Map(pendingOperations);
    newPendingOps.set(itemId, {
      type: 'delete',
      itemId,
      timestamp: Date.now(),
    });

    set({
      items: items.filter((item) => item.id !== itemId),
      pendingOperations: newPendingOps,
      error: null,
    });

    try {
      await itemsService.deleteItem(listId, itemId);
      // Remove pending operation
      const updatedPendingOps = new Map(get().pendingOperations);
      updatedPendingOps.delete(itemId);
      set({ pendingOperations: updatedPendingOps });
    } catch (error) {
      // Rollback optimistic update
      const currentItems = get().items;
      const updatedPendingOps = new Map(get().pendingOperations);
      updatedPendingOps.delete(itemId);

      set({
        items: [...currentItems, originalItem].sort((a, b) => {
          const aTime = a.updatedAt?.toDate?.()?.getTime() || 0;
          const bTime = b.updatedAt?.toDate?.()?.getTime() || 0;
          return aTime - bTime;
        }),
        pendingOperations: updatedPendingOps,
        error: error instanceof Error ? error.message : 'Failed to delete item',
      });
    }
  },

  toggleItem: async (itemId: string) => {
    const { listId, items, pendingOperations } = get();
    if (!listId) return;

    const itemIndex = items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    const originalItem = items[itemIndex];
    const newCompleted = !originalItem.completed;

    // Optimistic update
    const updatedItems = [...items];
    updatedItems[itemIndex] = { ...originalItem, completed: newCompleted };

    const newPendingOps = new Map(pendingOperations);
    newPendingOps.set(itemId, {
      type: 'toggle',
      itemId,
      timestamp: Date.now(),
    });

    set({
      items: updatedItems,
      pendingOperations: newPendingOps,
      error: null,
    });

    try {
      await itemsService.toggleItemCompleted(listId, itemId);
      // Real-time listener will confirm the update
      const updatedPendingOps = new Map(get().pendingOperations);
      updatedPendingOps.delete(itemId);
      set({ pendingOperations: updatedPendingOps });
    } catch (error) {
      // Rollback optimistic update
      const currentItems = get().items;
      const updatedPendingOps = new Map(get().pendingOperations);
      updatedPendingOps.delete(itemId);

      const rollbackItems = [...currentItems];
      const idx = rollbackItems.findIndex((item) => item.id === itemId);
      if (idx !== -1) {
        rollbackItems[idx] = originalItem;
      }

      set({
        items: rollbackItems,
        pendingOperations: updatedPendingOps,
        error: error instanceof Error ? error.message : 'Failed to toggle item',
      });
    }
  },

  clearItems: () => {
    set({
      items: [],
      error: null,
      pendingOperations: new Map(),
      listId: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Selector to check if an item has pending operations
export function isItemPending(itemId: string): boolean {
  return useItemsStore.getState().pendingOperations.has(itemId);
}

// Selector to get pending operation type for an item
export function getItemPendingType(
  itemId: string,
): PendingOperation['type'] | null {
  const pending = useItemsStore.getState().pendingOperations.get(itemId);
  return pending?.type ?? null;
}
