import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

export function ListScreen({ route, navigation }: ListScreenProps): React.JSX.Element {
  const { listId } = route.params;
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
  } = useItemsStore();
  const user = useAuthStore((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showShare, setShowShare] = useState(false);

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

  useEffect(() => {
    if (currentList) {
      navigation.setOptions({
        headerTitle: currentList.name,
      });
    }
  }, [currentList, navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Re-subscribe to refresh data
    const unsubscribeList = loadList(listId);
    const unsubscribeItems = subscribeToItems(listId);
    const unsubscribeParticipants = subscribeToParticipants(listId);

    // Wait a bit for data to load
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

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <ItemRow
        item={item}
        onToggle={() => handleToggleItem(item.id)}
        onDelete={() => handleDeleteItem(item.id)}
        onEdit={() => handleEditItem(item)}
      />
    ),
    [handleToggleItem, handleDeleteItem, handleEditItem],
  );

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, percentage };
  }, [items]);

  // Determine owner display text
  const ownerText = useMemo(() => {
    if (!currentList || !user) return '';
    const isOwner = currentList.ownerId === user.uid;
    return isOwner ? 'Created by You' : 'Shared with You';
  }, [currentList, user]);

  const error = listError || itemsError;

  if (listLoading && !currentList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5A998" />
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

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.listName} numberOfLines={1}>
              {currentList.name}
            </Text>
            <Text style={styles.subtitle}>
              {ownerText} • {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowShare(true)}
            style={styles.shareIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.shareIcon}>
              <View style={styles.shareIconArrow} />
              <View style={styles.shareIconBox} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {progressStats.completed} OF {progressStats.total} ITEMS SECURED
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressStats.percentage}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {itemsLoading && items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F5A998" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items yet</Text>
          <Text style={styles.emptySubtext}>Add your first item below</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#F5A998"
            />
          }
        />
      )}

      <AddItemInput onSubmit={handleAddItem} />

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
    backgroundColor: '#f5f5f5',
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
    color: '#333',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F5A998',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  listName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  shareIconButton: {
    padding: 8,
  },
  shareIcon: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#999',
    position: 'absolute',
    top: 0,
  },
  shareIconBox: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#999',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  progressContainer: {
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F5A998',
    borderRadius: 4,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 90,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
