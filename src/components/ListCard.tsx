import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ListWithStats } from '@/types';

const COLORS = {
  coral: '#F5A998',
  coralLight: '#FDF5F3',
  cardBackground: '#FFFFFF',
  headlineText: '#333',
  subtitleText: '#666',
  progressTrack: '#E8E8E8',
  activeBadgeBg: '#FDF5F3',
};

interface ListCardProps {
  list: ListWithStats;
  onPress: () => void;
}

export function ListCard({ list, onPress }: ListCardProps): React.JSX.Element {
  const progress = list.itemsTotal > 0 ? list.itemsCompleted / list.itemsTotal : 0;
  const isFinished = list.itemsTotal > 0 && list.itemsCompleted === list.itemsTotal;
  const isActive = checkIfActive(list.lastActivity);

  const contributorText = list.participantCount === 1
    ? 'Just you'
    : `${list.participantCount} contributors`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🛒</Text>
        </View>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {list.name}
            </Text>
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.contributors}>{contributorText}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressCount}>
            {isFinished ? 'Finished!' : `${list.itemsCompleted}/${list.itemsTotal} items`}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function checkIfActive(lastActivity?: { toDate: () => Date }): boolean {
  if (!lastActivity) return false;
  const now = new Date();
  const activityDate = lastActivity.toDate();
  const hoursSinceActivity = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceActivity < 24;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.coralLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.headlineText,
    flexShrink: 1,
  },
  activeBadge: {
    backgroundColor: COLORS.activeBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.coral,
    letterSpacing: 0.5,
  },
  contributors: {
    fontSize: 14,
    color: COLORS.subtitleText,
    marginTop: 2,
  },
  progressSection: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.subtitleText,
  },
  progressCount: {
    fontSize: 12,
    color: COLORS.subtitleText,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.progressTrack,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.coral,
    borderRadius: 3,
  },
});
