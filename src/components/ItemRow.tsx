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
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      <TouchableOpacity
        style={styles.container}
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
            <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
          )}
        </View>

        {(isPending || isOptimistic) && (
          <View style={styles.syncIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
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
  syncIndicator: {
    marginLeft: 8,
  },
  deleteAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
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
  },
  editButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
