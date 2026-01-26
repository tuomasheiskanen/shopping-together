import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useListStore } from '@/stores';
import { ListCard, FilterTabs, JoinListModal, CreateListModal } from '@/components';
import type { HomeScreenProps } from '@/navigation/types';
import type { ListFilter, ListWithStats } from '@/types';

const COLORS = {
  coral: '#F5A998',
  coralLight: '#FDF5F3',
  white: '#FFFFFF',
  headlineText: '#333',
  subtitleText: '#666',
  buttonBorder: '#E8E8E8',
  background: '#FAFAFA',
};

export function HomeScreen({ navigation }: HomeScreenProps): React.JSX.Element {
  const [filter, setFilter] = useState<ListFilter>('all');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    userLists,
    isLoadingLists,
    isLoading,
    subscribeToUserLists,
    createList,
    loadListByToken,
    joinList,
    refreshUserLists,
  } = useListStore();

  useEffect(() => {
    const unsubscribe = subscribeToUserLists();
    return () => unsubscribe();
  }, [subscribeToUserLists]);

  const filteredLists = useMemo(() => {
    switch (filter) {
      case 'shared':
        return userLists.filter((list) => list.participantCount > 1);
      case 'personal':
        return userLists.filter((list) => list.participantCount === 1);
      case 'recent':
        return [...userLists].sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
      default:
        return userLists;
    }
  }, [userLists, filter]);

  const handleListPress = useCallback(
    (list: ListWithStats) => {
      navigation.navigate('List', { listId: list.id });
    },
    [navigation],
  );

  const handleCreateList = useCallback(
    async (name: string) => {
      const listId = await createList({ name });
      if (listId) {
        setShowCreateModal(false);
        navigation.navigate('List', { listId });
      }
    },
    [createList, navigation],
  );

  const handleJoinList = useCallback(
    async (code: string) => {
      await loadListByToken(code);
      const list = useListStore.getState().currentList;

      if (list) {
        await joinList(list.id);
        setShowJoinModal(false);
        await refreshUserLists();
        navigation.navigate('List', { listId: list.id });
      } else {
        Alert.alert('Error', 'List not found. Check the code and try again.');
      }
    },
    [loadListByToken, joinList, navigation, refreshUserLists],
  );

  const renderListCard = useCallback(
    ({ item }: { item: ListWithStats }) => (
      <ListCard list={item} onPress={() => handleListPress(item)} />
    ),
    [handleListPress],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No lists yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first list or join an existing one to get started
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>SharedCart</Text>
          <Text style={styles.tagline}>your beautiful lists</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <FilterTabs selected={filter} onSelect={setFilter} />

      {/* Lists */}
      {isLoadingLists ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.coral} />
        </View>
      ) : (
        <FlatList
          data={filteredLists}
          renderItem={renderListCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => setShowJoinModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonIcon}>👥</Text>
          <Text style={styles.joinButtonText}>Join List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonIcon}>⊕</Text>
          <Text style={styles.createButtonText}>Create New List</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <JoinListModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinList}
        isLoading={isLoading}
      />
      <CreateListModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.headlineText,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.coral,
    fontFamily: 'DancingScript-Regular',
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.coralLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.headlineText,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.subtitleText,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 24 : 32,
    paddingTop: 12,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.buttonBorder,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.buttonBorder,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  joinButtonIcon: {
    fontSize: 16,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.headlineText,
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: COLORS.coral,
    gap: 8,
  },
  createButtonIcon: {
    fontSize: 16,
    color: COLORS.white,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
