import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Item } from '@/types';
import { useItemsStore } from '@/stores';

const COLORS = {
  coral: '#F5A998',
  coralLight: '#FFF5F3',
  green: '#7BC67E',
  greenLight: '#F2FBF3',
  white: '#FFFFFF',
  textPrimary: '#333',
  textSecondary: '#666',
  textMuted: '#999',
  border: '#f0f0f0',
  background: '#fafafa',
  claimBadge: '#F5A998',
  deleteRed: '#FF3B30',
};

interface ItemRowProps {
  item: Item;
  userId?: string;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onClaim: () => void;
  onUnclaim: () => void;
}

export function ItemRow({
  item,
  userId,
  onToggle,
  onDelete,
  onEdit,
  onClaim,
  onUnclaim,
}: ItemRowProps): React.JSX.Element {
  const swipeableRef = useRef<Swipeable>(null);
  const pendingOperations = useItemsStore((state) => state.pendingOperations);
  const isPending = pendingOperations.has(item.id);
  const isOptimistic = item.id.startsWith('temp_');

  const isCompleted = item.completed;
  const isClaimedByMe = !isCompleted && item.claimedBy === userId;
  const isClaimedByOther = !isCompleted && !!item.claimedBy && item.claimedBy !== userId;
  const isUnclaimed = !isCompleted && !item.claimedBy;

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-80, 0],
    });

    return (
      <Animated.View style={[styles.editAction, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            swipeableRef.current?.close();
            onEdit();
          }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderStatusIndicator = () => {
    if (isCompleted) {
      return (
        <View style={[styles.statusCircle, styles.statusCompleted]}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      );
    }
    if (isClaimedByMe) {
      return (
        <TouchableOpacity
          style={[styles.statusCircle, styles.statusClaimedByMe]}
          onPress={onUnclaim}
          activeOpacity={0.6}
        >
          <Text style={styles.statusEmoji}>🙋</Text>
        </TouchableOpacity>
      );
    }
    if (isClaimedByOther) {
      return (
        <View style={[styles.statusCircle, styles.statusClaimedByOther]}>
          <Text style={styles.statusEmoji}>👤</Text>
        </View>
      );
    }
    return <View style={[styles.statusCircle, styles.statusUnclaimed]} />;
  };

  const renderSubtitle = () => {
    const parts: string[] = [];

    if (isCompleted) {
      if (item.claimedBy === userId) {
        parts.push('Secured by you');
      } else if (item.claimedBy) {
        parts.push('Secured');
      }
    } else if (isClaimedByMe) {
      parts.push("You're picking this up · Tap to unclaim");
    } else if (isClaimedByOther) {
      parts.push('Claimed');
    } else {
      parts.push('Unclaimed');
    }

    if (item.quantity && item.quantity > 1) {
      parts.push(`Need ${item.quantity} packs`);
    }

    const text = parts.join(' · ');

    return (
      <Text
        style={[
          styles.subtitleText,
          isCompleted && styles.subtitleCompleted,
          isClaimedByMe && styles.subtitleClaimedByMe,
          isClaimedByOther && styles.subtitleClaimedByOther,
          isUnclaimed && styles.subtitleUnclaimed,
        ]}
      >
        {text}
      </Text>
    );
  };

  const renderRightAction = () => {
    if (isPending || isOptimistic) {
      return (
        <View style={styles.rightAction}>
          <ActivityIndicator size="small" color={COLORS.coral} />
        </View>
      );
    }

    if (isCompleted) {
      return (
        <TouchableOpacity style={styles.rightAction} onPress={onToggle}>
          <View style={[styles.actionCircle, styles.actionCompleted]}>
            <Text style={styles.actionCheckmark}>✓</Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (isClaimedByMe) {
      return (
        <TouchableOpacity style={styles.rightAction} onPress={onToggle}>
          <View style={[styles.actionCircle, styles.actionClaimedByMe]}>
            <Text style={styles.actionCheckmark}>✓</Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (isUnclaimed) {
      return (
        <TouchableOpacity style={styles.claimButton} onPress={onClaim}>
          <Text style={styles.claimButtonText}>CLAIM</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const containerBackground = isCompleted
    ? styles.containerCompleted
    : isClaimedByMe
      ? styles.containerClaimedByMe
      : isUnclaimed
        ? styles.containerUnclaimed
        : null;

  return (
    <View style={styles.cardWrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        friction={2}
        rightThreshold={40}
        leftThreshold={40}
      >
        <TouchableOpacity
          style={[styles.container, containerBackground]}
          onPress={isClaimedByMe ? onToggle : isUnclaimed ? onClaim : isClaimedByOther ? undefined : onToggle}
          onLongPress={onEdit}
          activeOpacity={0.7}
        >
          {renderStatusIndicator()}

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemText,
                isCompleted && styles.itemTextCompleted,
              ]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
            {renderSubtitle()}
          </View>

          {renderRightAction()}
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 5,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
  },
  containerCompleted: {
    backgroundColor: COLORS.white,
    opacity: 0.7,
  },
  containerClaimedByMe: {
    backgroundColor: COLORS.white,
  },
  containerUnclaimed: {
    backgroundColor: COLORS.white,
  },
  statusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusCompleted: {
    backgroundColor: COLORS.coral,
  },
  statusClaimedByMe: {
    backgroundColor: COLORS.coralLight,
  },
  statusClaimedByOther: {
    backgroundColor: '#f0f0f0',
  },
  statusUnclaimed: {
    backgroundColor: COLORS.green,
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
    marginRight: 24,
  },
  statusEmoji: {
    fontSize: 16,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  subtitleText: {
    fontSize: 13,
    marginTop: 2,
    color: COLORS.textSecondary,
  },
  subtitleCompleted: {
    color: COLORS.textMuted,
  },
  subtitleClaimedByMe: {
    color: COLORS.coral,
  },
  subtitleClaimedByOther: {
    color: COLORS.coral,
  },
  subtitleUnclaimed: {
    color: COLORS.textSecondary,
  },
  rightAction: {
    marginLeft: 10,
  },
  actionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCompleted: {
    backgroundColor: COLORS.coral,
  },
  actionClaimedByMe: {
    backgroundColor: COLORS.coral,
  },
  actionCheckmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  claimButton: {
    backgroundColor: COLORS.claimBadge,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  claimButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deleteAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  deleteButton: {
    backgroundColor: COLORS.deleteRed,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  editAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: COLORS.coral,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
