import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useListStore, useItemsStore } from '@/stores';
import { createShareUrl } from '@/utils/deepLink';
import type { ListScreenProps } from '@/navigation/types';

export function ListScreen({ route, navigation }: ListScreenProps): React.JSX.Element {
  const { listId } = route.params;
  const { currentList, loadList, isLoading: listLoading } = useListStore();
  const { items, subscribeToItems, isLoading: itemsLoading, toggleItem } = useItemsStore();

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

  const handleShare = async () => {
    if (!currentList) return;

    const shareUrl = createShareUrl(currentList.linkToken);
    try {
      await Share.share({
        message: `Join my shopping list "${currentList.name}"!\n\n${shareUrl}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (listLoading || !currentList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.listName}>{currentList.name}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => toggleItem(item.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxChecked,
                ]}
              >
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.itemText,
                  item.completed && styles.itemTextCompleted,
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* TODO: Add item input will go here */}
      <View style={styles.addItemPlaceholder}>
        <Text style={styles.addItemPlaceholderText}>
          Add item input coming in Phase 6
        </Text>
      </View>
    </View>
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
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
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
  addItemPlaceholder: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  addItemPlaceholderText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});
