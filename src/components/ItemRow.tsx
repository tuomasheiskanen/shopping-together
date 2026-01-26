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

interface ItemRowProps {
  item: Item;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function ItemRow({
  item,
  onToggle,
  onDelete,
  onEdit,
}: ItemRowProps): React.JSX.Element {
  const swipeableRef = useRef<Swipeable>(null);
  const pendingOperations = useItemsStore((state) => state.pendingOperations);
  const isPending = pendingOperations.has(item.id);
  const isOptimistic = item.id.startsWith('temp_');

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
          style={[styles.container, item.completed && styles.containerCompleted]}
          onPress={onToggle}
          onLongPress={onEdit}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              item.completed && styles.checkboxChecked,
            ]}
          >
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemText,
                item.completed && styles.itemTextCompleted,
              ]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
            {item.quantity && item.quantity > 1 && (
              <Text style={[styles.quantityText, item.completed && styles.quantityTextCompleted]}>
                Qty: {item.quantity}
              </Text>
            )}
          </View>

          {(isPending || isOptimistic) && (
            <View style={styles.syncIndicator}>
              <ActivityIndicator size="small" color="#F5A998" />
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  containerCompleted: {
    backgroundColor: '#fafafa',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#F5A998',
    borderColor: '#F5A998',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityTextCompleted: {
    color: '#aaa',
  },
  syncIndicator: {
    marginLeft: 8,
  },
  deleteAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 6,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
    marginVertical: 6,
  },
  editButton: {
    backgroundColor: '#F5A998',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
