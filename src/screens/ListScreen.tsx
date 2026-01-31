import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListStore, useItemsStore, useAuthStore } from '@/stores';
import { createShareUrl } from '@/utils/deepLink';
import {
  ItemRow,
  AddItemInput,
  EditItemModal,
  ShareSheet,
  SyncStatusBar,
} from '@/components';
import type { ListScreenProps } from '@/navigation/types';
import type { Item } from '@/types';

const COLORS = {
  coral: '#F5A998',
  coralLight: '#FDF5F3',
  white: '#FFFFFF',
  background: '#fdfcf8',
  headlineText: '#333',
  subtitleText: '#666',
  progressBg: '#F5E6E1',
  progressText: '#B07A6E',
};

export function ListScreen({ route, navigation }: ListScreenProps): React.JSX.Element {
  const { listId } = route.params;
  const insets = useSafeAreaInsets();
  const {
    currentList,
    loadList,
    isLoading: listLoading,
    error: listError,
    participants,
    subscribeToParticipants,
  } = useListStore();
  const {
    items,
    subscribeToItems,
    isLoading: itemsLoading,
    error: itemsError,
    toggleItem,
    deleteItem,
    updateItem,
    addItem,
    reorderItems,
  } = useItemsStore();
  const user = useAuthStore((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Hide the default navigation header
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribeList = loadList(listId);
    const unsubscribeItems = subscribeToItems(listId);
    const unsubscribeParticipants = subscribeToParticipants(listId);

    return () => {
      unsubscribeList();
      unsubscribeItems();
      unsubscribeParticipants();
    };
  }, [listId, loadList, subscribeToItems, subscribeToParticipants]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const unsubscribeList = loadList(listId);
    const unsubscribeItems = subscribeToItems(listId);
    const unsubscribeParticipants = subscribeToParticipants(listId);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);

    return () => {
      unsubscribeList();
      unsubscribeItems();
      unsubscribeParticipants();
    };
  }, [listId, loadList, subscribeToItems, subscribeToParticipants]);

  const handleAddItem = async (text: string) => {
    await addItem({ text });
  };

  const handleToggleItem = useCallback(
    (itemId: string) => {
      toggleItem(itemId);
    },
    [toggleItem],
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      deleteItem(itemId);
    },
    [deleteItem],
  );

  const handleEditItem = useCallback((item: Item) => {
    setEditingItem(item);
  }, []);

  const handleSaveEdit = async (text: string) => {
    if (editingItem) {
      await updateItem(editingItem.id, { text });
    }
  };

  const handleClaimItem = useCallback(
    (itemId: string) => {
      if (user) {
        updateItem(itemId, { claimedBy: user.uid });
      }
    },
    [user, updateItem],
  );

  const handleUnclaimItem = useCallback(
    (itemId: string) => {
      updateItem(itemId, { claimedBy: null } as any);
    },
    [updateItem],
  );

  const isShared = participants.length > 1;

  const participantNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of participants) {
      if (p.displayName) {
        map[p.userId] = p.displayName;
      }
    }
    return map;
  }, [participants]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Item>) => (
      <ItemRow
        item={item}
        userId={user?.uid}
        isShared={isShared}
        participantNames={participantNames}
        onToggle={() => handleToggleItem(item.id)}
        onDelete={() => handleDeleteItem(item.id)}
        onEdit={() => handleEditItem(item)}
        onClaim={() => handleClaimItem(item.id)}
        onUnclaim={() => handleUnclaimItem(item.id)}
        drag={drag}
        isActive={isActive}
      />
    ),
    [handleToggleItem, handleDeleteItem, handleEditItem, handleClaimItem, handleUnclaimItem, user, isShared, participantNames],
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: Item[] }) => {
      reorderItems(data);
    },
    [reorderItems],
  );

  const progressStats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, percentage };
  }, [items]);

  const ownerText = useMemo(() => {
    if (!currentList || !user) return '';
    const isOwner = currentList.ownerId === user.uid;
    return isOwner ? 'You' : 'Shared';
  }, [currentList, user]);

  const error = listError || itemsError;

  if (listLoading && !currentList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.coral} />
      </View>
    );
  }

  if (error && !currentList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadList(listId)}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>List not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const shareUrl = createShareUrl(currentList.linkToken);
  const memberCount = participants.length;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SyncStatusBar />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Logo row */}
        <View style={styles.logoRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.logoIcon}>🛒</Text>
          <Text style={styles.logoText}>ShoppingTogether</Text>
        </View>

        {/* List name + share */}
        <View style={styles.titleRow}>
          <Text style={styles.listName} numberOfLines={2}>
            {currentList.name}
          </Text>
          <TouchableOpacity
            onPress={() => setShowShare(true)}
            style={styles.shareButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.shareButtonIcon}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Created by <Text style={styles.subtitleBold}>{ownerText}</Text> · {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </Text>

        {/* Progress pill */}
        {items.length > 0 && (
          <View style={styles.progressPill}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressStats.percentage}%` },
              ]}
            />
            <Text style={styles.progressText}>
              {progressStats.completed} OF {progressStats.total} ITEMS SECURED
            </Text>
          </View>
        )}
      </View>

      {/* Items list */}
      <View style={styles.listContainer}>
        {itemsLoading && items.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.coral} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptySubtext}>Add your first item below</Text>
          </View>
        ) : (
          <DraggableFlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.coral}
              />
            }
          />
        )}
      </View>

      {keyboardVisible && (
        <Pressable
          style={styles.keyboardDismissOverlay}
          onPress={Keyboard.dismiss}
        />
      )}

      <View style={styles.addItemWrapper}>
        <AddItemInput onSubmit={handleAddItem} />
      </View>

      </KeyboardAvoidingView>

      <EditItemModal
        visible={!!editingItem}
        item={editingItem}
        onSave={handleSaveEdit}
        onCancel={() => setEditingItem(null)}
      />

      <ShareSheet
        visible={showShare}
        listName={currentList.name}
        shareUrl={shareUrl}
        onClose={() => setShowShare(false)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.headlineText,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.subtitleText,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.coral,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    paddingRight: 4,
  },
  backArrow: {
    fontSize: 32,
    color: COLORS.headlineText,
    fontWeight: '300',
    marginTop: -2,
  },
  logoIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.headlineText,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listName: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.headlineText,
    flex: 1,
    marginRight: 12,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
    }),
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  shareButtonIcon: {
    fontSize: 18,
    color: COLORS.headlineText,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subtitleText,
    marginBottom: 16,
  },
  subtitleBold: {
    fontWeight: '700',
    color: COLORS.headlineText,
  },
  progressPill: {
    height: 32,
    backgroundColor: COLORS.progressBg,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.coral,
    borderRadius: 16,
    opacity: 0.3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.progressText,
    letterSpacing: 0.8,
  },
  listContainer: {
    flex: 1,
  },
  keyboardDismissOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  addItemWrapper: {
    zIndex: 2,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.subtitleText,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
