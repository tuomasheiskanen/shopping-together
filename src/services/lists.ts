import firestore from '@react-native-firebase/firestore';
import { List, CreateListInput, UpdateListInput, ListWithStats } from '@/types';
import { generateToken } from '@/utils/generateToken';
import { getCurrentUser } from './auth';
import { addParticipant, getParticipants } from './participants';
import { getItemCounts } from './items';

const listsCollection = firestore().collection('lists');

/**
 * Create a new list
 * The current user becomes the owner and is added as a participant
 */
export async function createList(input: CreateListInput): Promise<List> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Must be authenticated to create a list');
  }

  const listRef = listsCollection.doc();
  const listData = {
    name: input.name,
    ownerId: user.uid,
    linkToken: generateToken(),
    createdAt: firestore.FieldValue.serverTimestamp(),
    archived: false,
  };

  await listRef.set(listData);

  // Add creator as participant
  await addParticipant(listRef.id, user.uid, user.isAnonymous ? 'anonymous' : 'account', user.displayName || undefined);

  // Return the created list
  const snapshot = await listRef.get();
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as List;
}

/**
 * Get a single list by ID
 */
export async function getList(listId: string): Promise<List | null> {
  const snapshot = await listsCollection.doc(listId).get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as List;
}

/**
 * Find a list by its share link token
 */
export async function getListByLinkToken(token: string): Promise<List | null> {
  const querySnapshot = await listsCollection
    .where('linkToken', '==', token)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as List;
}

/**
 * Update a list
 */
export async function updateList(
  listId: string,
  data: UpdateListInput,
): Promise<void> {
  await listsCollection.doc(listId).update(data);
}

/**
 * Delete a list and all its subcollections
 * Only the owner should call this (enforced by security rules)
 */
export async function deleteList(listId: string): Promise<void> {
  const listRef = listsCollection.doc(listId);

  // Delete items subcollection
  const itemsSnapshot = await listRef.collection('items').get();
  const itemsBatch = firestore().batch();
  itemsSnapshot.docs.forEach((doc) => {
    itemsBatch.delete(doc.ref);
  });
  await itemsBatch.commit();

  // Delete participants subcollection
  const participantsSnapshot = await listRef.collection('participants').get();
  const participantsBatch = firestore().batch();
  participantsSnapshot.docs.forEach((doc) => {
    participantsBatch.delete(doc.ref);
  });
  await participantsBatch.commit();

  // Delete the list document
  await listRef.delete();
}

/**
 * Regenerate the share link token for a list
 * Only the owner should call this (enforced by security rules)
 */
export async function regenerateLinkToken(listId: string): Promise<string> {
  const newToken = generateToken();
  await listsCollection.doc(listId).update({
    linkToken: newToken,
  });
  return newToken;
}

/**
 * Subscribe to real-time updates for a list
 * @returns Unsubscribe function
 */
export function subscribeToList(
  listId: string,
  callback: (list: List | null) => void,
  onError?: (error: Error) => void,
): () => void {
  return listsCollection.doc(listId).onSnapshot(
    (snapshot) => {
      if (!snapshot.exists) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      } as List);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
}

/**
 * Get all lists where a user is a participant
 * Uses collection group query on 'participants' collection
 */
export async function getUserLists(userId: string): Promise<ListWithStats[]> {
  // Query all participant documents where the user is a member
  const participantsQuery = await firestore()
    .collectionGroup('participants')
    .where('userId', '==', userId)
    .get();

  const matchingDocs = participantsQuery.docs;

  // Extract list IDs from the participant document paths
  const listIds = matchingDocs.map(doc => {
    // Path format: lists/{listId}/participants/{participantId}
    const pathParts = doc.ref.path.split('/');
    return pathParts[1]; // Get the listId
  });

  if (listIds.length === 0) {
    return [];
  }

  // Fetch all list documents and their stats
  const listsWithStatsOrNull = await Promise.all(
    listIds.map(async (listId) => {
      const listDoc = await listsCollection.doc(listId).get();
      if (!listDoc.exists) {
        return null;
      }

      const listData = listDoc.data();
      const [participants, itemCounts] = await Promise.all([
        getParticipants(listId),
        getItemCounts(listId),
      ]);

      return {
        id: listDoc.id,
        ...listData,
        participantCount: participants.length,
        itemsTotal: itemCounts.total,
        itemsCompleted: itemCounts.completed,
        isOwner: listData?.ownerId === userId,
      } as ListWithStats;
    }),
  );

  // Filter out any null results and return
  return listsWithStatsOrNull.filter((list): list is ListWithStats => list !== null);
}

/**
 * Subscribe to real-time updates for all user's lists
 * @returns Unsubscribe function
 */
export function subscribeToUserLists(
  userId: string,
  callback: (lists: ListWithStats[]) => void,
  onError?: (error: Error) => void,
): () => void {
  // Subscribe to changes in the user's participant documents
  return firestore()
    .collectionGroup('participants')
    .where('userId', '==', userId)
    .onSnapshot(
      async (snapshot) => {
        const matchingDocs = snapshot.docs;

        // Extract list IDs
        const listIds = matchingDocs.map(doc => {
          const pathParts = doc.ref.path.split('/');
          return pathParts[1];
        });

        if (listIds.length === 0) {
          callback([]);
          return;
        }

        // Fetch all lists with stats
        const listsWithStatsOrNull = await Promise.all(
          listIds.map(async (listId) => {
            const listDoc = await listsCollection.doc(listId).get();
            if (!listDoc.exists) {
              return null;
            }

            const listData = listDoc.data();
            const [participants, itemCounts] = await Promise.all([
              getParticipants(listId),
              getItemCounts(listId),
            ]);

            return {
              id: listDoc.id,
              ...listData,
              participantCount: participants.length,
              itemsTotal: itemCounts.total,
              itemsCompleted: itemCounts.completed,
              isOwner: listData?.ownerId === userId,
            } as ListWithStats;
          }),
        );

        callback(listsWithStatsOrNull.filter((list): list is ListWithStats => list !== null));
      },
      (error) => {
        if (onError) {
          onError(error);
        }
      },
    );
}
