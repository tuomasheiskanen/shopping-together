import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { User } from '@/types';

/**
 * Sign in anonymously
 * Creates a new anonymous user if not already signed in
 */
export async function signInAnonymously(): Promise<User> {
  const userCredential = await auth().signInAnonymously();
  return mapFirebaseUser(userCredential.user);
}

/**
 * Get the current authenticated user
 * Returns null if not signed in
 */
export function getCurrentUser(): User | null {
  const firebaseUser = auth().currentUser;
  if (!firebaseUser) {
    return null;
  }
  return mapFirebaseUser(firebaseUser);
}

/**
 * Subscribe to auth state changes
 * @param callback Function called when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void,
): () => void {
  return auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUser(firebaseUser));
    } else {
      callback(null);
    }
  });
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  await auth().signOut();
}

/**
 * Map Firebase user to our User type
 */
function mapFirebaseUser(firebaseUser: FirebaseAuthTypes.User): User {
  return {
    uid: firebaseUser.uid,
    isAnonymous: firebaseUser.isAnonymous,
    email: firebaseUser.email,
  };
}
