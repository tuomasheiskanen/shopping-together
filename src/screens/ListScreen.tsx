import React, { useEffect, useState, useCallback } from 'react';
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
import { useListStore, useItemsStore } from '@/stores';
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
  const { currentList, loadList, isLoading: listLoading, error: listError } = useListStore();
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

  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const unsubscribeList = loadList(listId);
    const unsubscribeItems = subscribeToItems(listId);

    return () => {
      unsubscribeList();
      unsubscribeItems();
    };
  }, [listId, loadList, subscribeToItems]);

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

    // Wait a bit for data to load
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);

    return () => {
      unsubscribeList();
      unsubscribeItems();
    };
  }, [listId, loadList, subscribeToItems]);

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

  const error = listError || itemsError;

  if (listLoading && !currentList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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

  return (
    <GestureHandlerRootView style={styles.container}>
      <SyncStatusBar />

      <View style={styles.header}>
        <Text style={styles.listName} numberOfLines={1}>
          {currentList.name}
        </Text>
        <TouchableOpacity
          onPress={() => setShowShare(true)}
          style={styles.shareButton}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {itemsLoading && items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
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
              tintColor="#007AFF"
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
    backgroundColor: '#fff',
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
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
