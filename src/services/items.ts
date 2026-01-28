import firestore from '@react-native-firebase/firestore';
import { Item, CreateItemInput, UpdateItemInput } from '@/types';

/**
 * Get the items collection reference for a list
 */
function getItemsCollection(listId: string) {
  return firestore().collection('lists').doc(listId).collection('items');
}

/**
 * Add a new item to a list
 */
export async function addItem(
  listId: string,
  input: CreateItemInput,
): Promise<Item> {
  const itemRef = getItemsCollection(listId).doc();

  const itemData = {
    text: input.text,
    quantity: input.quantity ?? null,
    claimedBy: null,
    completed: false,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  await itemRef.set(itemData);

  const snapshot = await itemRef.get();
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Item;
}

/**
 * Update an item
 */
export async function updateItem(
  listId: string,
  itemId: string,
  data: UpdateItemInput,
): Promise<void> {
  await getItemsCollection(listId).doc(itemId).update({
    ...data,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Delete an item
 */
export async function deleteItem(listId: string, itemId: string): Promise<void> {
  await getItemsCollection(listId).doc(itemId).delete();
}

/**
 * Toggle the completed state of an item
 */
export async function toggleItemCompleted(
  listId: string,
  itemId: string,
): Promise<void> {
  const itemRef = getItemsCollection(listId).doc(itemId);
  const snapshot = await itemRef.get();

  if (!snapshot.exists) {
    throw new Error('Item not found');
  }

  const currentCompleted = snapshot.data()?.completed ?? false;

  await itemRef.update({
    completed: !currentCompleted,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Get all items in a list
 */
export async function getItems(listId: string): Promise<Item[]> {
  const snapshot = await getItemsCollection(listId)
    .orderBy('updatedAt', 'asc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Item[];
}

/**
 * Subscribe to real-time updates for items
 * Items are ordered by updatedAt ascending (oldest first)
 * @returns Unsubscribe function
 */
export function subscribeToItems(
  listId: string,
  callback: (items: Item[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return getItemsCollection(listId)
    .orderBy('updatedAt', 'asc')
    .onSnapshot(
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[];

        callback(items);
      },
      (error) => {
        if (onError) {
          onError(error);
        }
      },
    );
}

/**
 * Get item counts for a list (total and completed)
 */
export async function getItemCounts(listId: string): Promise<{ total: number; completed: number }> {
  const snapshot = await getItemsCollection(listId).get();

  let total = 0;
  let completed = 0;

  snapshot.docs.forEach((doc) => {
    total++;
    if (doc.data().completed) {
      completed++;
    }
  });

  return { total, completed };
}
