import firestore from '@react-native-firebase/firestore';
import { Item, CreateItemInput, UpdateItemInput } from '@/types';

interface OrderUpdate {
  id: string;
  sortOrder: number;
}

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

  // Query the current min sortOrder to place new item at the top
  const minSnapshot = await getItemsCollection(listId)
    .orderBy('sortOrder', 'asc')
    .limit(1)
    .get();

  let nextSortOrder = 0;
  if (!minSnapshot.empty) {
    const minSortOrder = minSnapshot.docs[0].data().sortOrder;
    nextSortOrder = typeof minSortOrder === 'number' ? minSortOrder - 1 : 0;
  }

  const itemData = {
    text: input.text,
    quantity: input.quantity ?? null,
    claimedBy: null,
    completed: false,
    sortOrder: nextSortOrder,
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
 * Set the completed state of an item
 */
export async function toggleItemCompleted(
  listId: string,
  itemId: string,
  completed: boolean,
): Promise<void> {
  await getItemsCollection(listId).doc(itemId).update({
    completed,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Get all items in a list
 */
export async function getItems(listId: string): Promise<Item[]> {
  const snapshot = await getItemsCollection(listId).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Item[];
}

/**
 * Subscribe to real-time updates for items
 * Items are sorted client-side by sortOrder to support drag-to-reorder
 * @returns Unsubscribe function
 */
export function subscribeToItems(
  listId: string,
  callback: (items: Item[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return getItemsCollection(listId)
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
 * Reorder items by updating their sortOrder values in a batch
 */
export async function reorderItems(
  listId: string,
  orderUpdates: OrderUpdate[],
): Promise<void> {
  const batch = firestore().batch();
  const collection = getItemsCollection(listId);

  for (const update of orderUpdates) {
    batch.update(collection.doc(update.id), { sortOrder: update.sortOrder });
  }

  await batch.commit();
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
