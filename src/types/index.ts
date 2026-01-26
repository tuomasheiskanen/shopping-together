import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Document types (with id)
export interface List {
  id: string;
  name: string;
  ownerId: string;
  linkToken: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  archived: boolean;
}

export interface Item {
  id: string;
  text: string;
  quantity?: number;
  claimedBy?: string;
  completed: boolean;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface Participant {
  id: string;
  userId: string;
  joinedAt: FirebaseFirestoreTypes.Timestamp;
  type: 'anonymous' | 'account';
}

export interface User {
  uid: string;
  isAnonymous: boolean;
  email?: string | null;
}

// Document data types (without id, for Firestore writes)
export type ListData = Omit<List, 'id'>;
export type ItemData = Omit<Item, 'id'>;
export type ParticipantData = Omit<Participant, 'id'>;

// Create input types (for creating new documents)
export interface CreateListInput {
  name: string;
}

export interface CreateItemInput {
  text: string;
  quantity?: number;
}

// Update input types (partial updates)
export type UpdateListInput = Partial<Pick<List, 'name' | 'archived' | 'linkToken'>>;
export type UpdateItemInput = Partial<Pick<Item, 'text' | 'quantity' | 'claimedBy' | 'completed'>>;

// Firestore converter helper type
export type FirestoreConverter<T> = {
  toFirestore: (data: Omit<T, 'id'>) => FirebaseFirestoreTypes.DocumentData;
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => T;
};

// Converters for type-safe Firestore operations
export const listConverter: FirestoreConverter<List> = {
  toFirestore: (list) => ({
    name: list.name,
    ownerId: list.ownerId,
    linkToken: list.linkToken,
    createdAt: list.createdAt,
    archived: list.archived,
  }),
  fromFirestore: (snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  } as List),
};

export const itemConverter: FirestoreConverter<Item> = {
  toFirestore: (item) => ({
    text: item.text,
    quantity: item.quantity,
    claimedBy: item.claimedBy,
    completed: item.completed,
    updatedAt: item.updatedAt,
  }),
  fromFirestore: (snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  } as Item),
};

export const participantConverter: FirestoreConverter<Participant> = {
  toFirestore: (participant) => ({
    userId: participant.userId,
    joinedAt: participant.joinedAt,
    type: participant.type,
  }),
  fromFirestore: (snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  } as Participant),
};

// Extended list type with stats for display
export interface ListWithStats extends List {
  participantCount: number;
  itemsTotal: number;
  itemsCompleted: number;
  isOwner: boolean;
  lastActivity?: FirebaseFirestoreTypes.Timestamp;
}

// Filter types for list display
export type ListFilter = 'all' | 'shared' | 'personal' | 'recent';
