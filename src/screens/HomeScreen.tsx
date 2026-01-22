import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useListStore } from '@/stores';
import type { HomeScreenProps } from '@/navigation/types';

export function HomeScreen({ navigation }: HomeScreenProps): React.JSX.Element {
  const [listName, setListName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { createList, loadListByToken, joinList, isLoading } = useListStore();

  const handleCreateList = async () => {
    if (!listName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    const listId = await createList({ name: listName.trim() });
    if (listId) {
      setListName('');
      navigation.navigate('List', { listId });
    }
  };

  const handleJoinList = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }

    await loadListByToken(joinCode.trim());
    const list = useListStore.getState().currentList;

    if (list) {
      await joinList(list.id);
      setJoinCode('');
      navigation.navigate('List', { listId: list.id });
    } else {
      Alert.alert('Error', 'List not found. Check the code and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShoppingTogether</Text>
      <Text style={styles.subtitle}>Collaborative Shopping Lists</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New List</Text>
        <TextInput
          style={styles.input}
          placeholder="List name (e.g., Thanksgiving Dinner)"
          value={listName}
          onChangeText={setListName}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCreateList}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Create List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join Existing List</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter join code"
          value={joinCode}
          onChangeText={setJoinCode}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleJoinList}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Join List
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 48,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
});
