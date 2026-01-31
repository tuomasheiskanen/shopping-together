import firestore from '@react-native-firebase/firestore';
import { Participant } from '@/types';

/**
 * Get the participants collection reference for a list
 */
function getParticipantsCollection(listId: string) {
  return firestore().collection('lists').doc(listId).collection('participants');
}

/**
 * Add a participant to a list
 * The participant ID is the user's UID
 */
export async function addParticipant(
  listId: string,
  userId: string,
  type: 'anonymous' | 'account',
  displayName?: string,
): Promise<Participant> {
  const participantRef = getParticipantsCollection(listId).doc(userId);

  const participantData: Record<string, unknown> = {
    userId, // Store userId as a field for collection group queries
    joinedAt: firestore.FieldValue.serverTimestamp(),
    type,
  };

  if (displayName) {
    participantData.displayName = displayName;
  }

  await participantRef.set(participantData);

  const snapshot = await participantRef.get();
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Participant;
}

/**
 * Get all participants of a list
 */
export async function getParticipants(listId: string): Promise<Participant[]> {
  const snapshot = await getParticipantsCollection(listId).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Participant[];
}

/**
 * Check if a user is a participant of a list
 */
export async function isParticipant(
  listId: string,
  userId: string,
): Promise<boolean> {
  const snapshot = await getParticipantsCollection(listId).doc(userId).get();
  // In React Native Firebase, exists can be a getter function
  const exists = typeof snapshot.exists === 'function'
    ? (snapshot.exists as unknown as () => boolean)()
    : snapshot.exists;
  return Boolean(exists);
}

/**
 * Subscribe to real-time updates for participants
 * @returns Unsubscribe function
 */
export function subscribeToParticipants(
  listId: string,
  callback: (participants: Participant[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return getParticipantsCollection(listId).onSnapshot(
    (snapshot) => {
      const participants = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Participant[];

      callback(participants);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
}
