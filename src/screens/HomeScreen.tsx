import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useListStore } from '@/stores';
import { ListCard, FilterTabs, CreateListModal } from '@/components';
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
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<ListFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    userLists,
    isLoadingLists,
    isLoading,
    subscribeToUserLists,
    createList,
    refreshUserLists,
  } = useListStore();

  useEffect(() => {
    const unsubscribe = subscribeToUserLists();
    return () => unsubscribe();
  }, [subscribeToUserLists]);

  // Refresh lists when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshUserLists();
    }, [refreshUserLists])
  );

  const filteredLists = useMemo(() => {
    const sortByCreatedDesc = (lists: ListWithStats[]) =>
      [...lists].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });

    switch (filter) {
      case 'shared':
        return sortByCreatedDesc(userLists.filter((list) => list.participantCount > 1));
      case 'personal':
        return sortByCreatedDesc(userLists.filter((list) => list.participantCount === 1));
      case 'recent':
      default:
        return sortByCreatedDesc(userLists);
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

      {/* Create Button */}
      <View style={[styles.createButtonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
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
    paddingBottom: 90,
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
  createButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  createButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
    marginTop: -2,
  },
});
