import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

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
  joinedAt: FirebaseFirestoreTypes.Timestamp;
  type: 'anonymous' | 'account';
}

export interface User {
  uid: string;
  isAnonymous: boolean;
  email?: string | null;
}
