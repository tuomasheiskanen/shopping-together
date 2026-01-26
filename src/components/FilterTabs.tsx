import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ListFilter } from '@/types';

const COLORS = {
  coral: '#F5A998',
  white: '#FFFFFF',
  headlineText: '#333',
};

interface FilterTabsProps {
  selected: ListFilter;
  onSelect: (filter: ListFilter) => void;
}

const FILTERS: { key: ListFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'shared', label: 'Shared' },
  { key: 'personal', label: 'Personal' },
  { key: 'recent', label: 'Recent' },
];

export function FilterTabs({ selected, onSelect }: FilterTabsProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.tab,
              selected === filter.key && styles.tabSelected,
            ]}
            onPress={() => onSelect(filter.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                selected === filter.key && styles.tabTextSelected,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabSelected: {
    backgroundColor: COLORS.coral,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.headlineText,
  },
  tabTextSelected: {
    color: COLORS.white,
  },
});
