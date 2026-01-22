# ShoppingTogether - Project Task List

## Phase 1: Project Setup

### 1.1 React Native Initialization
- [x] Create new React Native project with TypeScript template
- [ ] Verify project builds on iOS simulator (blocked: CocoaPods/Ruby issues)
- [ ] Verify project builds on Android emulator
- [ ] Remove boilerplate code and default screens

### 1.2 Project Structure
- [x] Create `/src` directory structure
- [x] Create `/src/screens` folder
- [x] Create `/src/components` folder
- [x] Create `/src/services` folder
- [x] Create `/src/stores` folder
- [x] Create `/src/types` folder
- [x] Create `/src/utils` folder
- [x] Create `/src/hooks` folder
- [x] Create `/src/navigation` folder

### 1.3 Development Tools
- [x] Install and configure ESLint with TypeScript rules
- [x] Install and configure Prettier
- [x] Add `.editorconfig` file
- [ ] Set up pre-commit hooks with husky (optional)
- [x] Add path aliases in `tsconfig.json`

### 1.4 Core Dependencies
- [x] Install React Navigation packages
- [x] Install Zustand
- [x] Install Firebase React Native SDK (`@react-native-firebase/app`)
- [x] Install Firebase Auth (`@react-native-firebase/auth`)
- [x] Install Firebase Firestore (`@react-native-firebase/firestore`)

---

## Phase 2: Firebase Backend Setup

### 2.1 Firebase Console Setup
- [ ] Create new Firebase project in console
- [ ] Register iOS app in Firebase project
- [ ] Download `GoogleService-Info.plist` and add to iOS project
- [ ] Register Android app in Firebase project
- [ ] Download `google-services.json` and add to Android project
- [ ] Enable Firestore database (start in test mode)
- [ ] Enable Anonymous Authentication provider

### 2.2 Firebase Configuration in App
- [ ] Configure Firebase for iOS (Podfile, AppDelegate)
- [ ] Configure Firebase for Android (build.gradle files)
- [ ] Verify Firebase initializes correctly on app launch
- [ ] Test anonymous sign-in works

### 2.3 Firestore Security Rules
- [ ] Write security rule: require authentication for all operations
- [ ] Write security rule: list access requires participant document
- [ ] Write security rule: only owner can delete list
- [ ] Write security rule: only owner can regenerate linkToken
- [ ] Write security rule: validate item document shape on write
- [ ] Write security rule: validate list document shape on write
- [ ] Deploy security rules to Firebase

### 2.4 Firebase Emulator Setup
- [ ] Install Firebase CLI globally
- [ ] Initialize Firebase project locally (`firebase init`)
- [ ] Configure Firestore emulator
- [ ] Configure Auth emulator
- [ ] Create npm script to start emulators
- [ ] Configure app to use emulators in development

---

## Phase 3: TypeScript Types & Data Layer

### 3.1 Type Definitions
- [x] Define `List` interface (id, name, ownerId, linkToken, createdAt, archived)
- [x] Define `Item` interface (id, text, quantity, claimedBy, completed, updatedAt)
- [x] Define `Participant` interface (id, joinedAt, type)
- [x] Define `User` interface (uid, isAnonymous, email?)
- [ ] Define Firestore converter types for type-safe queries
- [ ] Export all types from `/src/types/index.ts`

### 3.2 Firestore Service - Authentication
- [ ] Create `src/services/auth.ts`
- [ ] Implement `signInAnonymously()` function
- [ ] Implement `getCurrentUser()` function
- [ ] Implement `onAuthStateChanged()` listener wrapper
- [ ] Implement `signOut()` function

### 3.3 Firestore Service - Lists
- [ ] Create `src/services/lists.ts`
- [ ] Implement `createList(name)` - creates list with owner as current user
- [ ] Implement `getList(listId)` - fetch single list
- [ ] Implement `getListByLinkToken(token)` - find list by share token
- [ ] Implement `updateList(listId, data)` - partial update
- [ ] Implement `deleteList(listId)` - delete list and subcollections
- [ ] Implement `regenerateLinkToken(listId)` - generate new share token
- [ ] Implement `subscribeToList(listId, callback)` - real-time listener

### 3.4 Firestore Service - Participants
- [ ] Create `src/services/participants.ts`
- [ ] Implement `addParticipant(listId, userId)` - join list
- [ ] Implement `getParticipants(listId)` - fetch all participants
- [ ] Implement `isParticipant(listId, userId)` - check membership
- [ ] Implement `subscribeToParticipants(listId, callback)` - real-time listener

### 3.5 Firestore Service - Items
- [ ] Create `src/services/items.ts`
- [ ] Implement `addItem(listId, text)` - create new item
- [ ] Implement `updateItem(listId, itemId, data)` - partial update
- [ ] Implement `deleteItem(listId, itemId)` - remove item
- [ ] Implement `toggleItemCompleted(listId, itemId)` - mark done/undone
- [ ] Implement `subscribeToItems(listId, callback)` - real-time listener
- [ ] Ensure all writes use `serverTimestamp()` for `updatedAt`

### 3.6 Utility Functions
- [ ] Create `src/utils/generateToken.ts` - generate unique share tokens
- [ ] Create `src/utils/deepLink.ts` - parse and create share URLs

---

## Phase 4: State Management (Zustand)

### 4.1 Auth Store
- [ ] Create `src/stores/authStore.ts`
- [ ] Define state: `user`, `isLoading`, `isInitialized`
- [ ] Implement `initialize()` action - set up auth listener
- [ ] Implement `signIn()` action - anonymous sign in
- [ ] Implement `signOut()` action
- [ ] Handle auth state persistence

### 4.2 Lists Store
- [ ] Create `src/stores/listStore.ts`
- [ ] Define state: `currentList`, `isLoading`, `error`
- [ ] Implement `loadList(listId)` action
- [ ] Implement `loadListByToken(token)` action
- [ ] Implement `createList(name)` action
- [ ] Implement `updateList(data)` action
- [ ] Implement `clearList()` action
- [ ] Set up real-time subscription management
- [ ] Handle subscription cleanup on unmount

### 4.3 Items Store
- [ ] Create `src/stores/itemsStore.ts`
- [ ] Define state: `items`, `isLoading`, `pendingOperations`
- [ ] Implement `subscribeToItems(listId)` action
- [ ] Implement `addItem(text)` action with optimistic update
- [ ] Implement `updateItem(itemId, data)` action with optimistic update
- [ ] Implement `deleteItem(itemId)` action with optimistic update
- [ ] Implement `toggleItem(itemId)` action with optimistic update
- [ ] Handle failed operations (rollback optimistic updates)
- [ ] Track pending/syncing state per item

### 4.4 Sync Status Store
- [ ] Create `src/stores/syncStore.ts`
- [ ] Define state: `isOnline`, `hasPendingWrites`, `lastSyncTime`
- [ ] Implement network status listener
- [ ] Implement Firestore pending writes detection
- [ ] Expose sync status for UI indicators

---

## Phase 5: Navigation Setup

### 5.1 Navigation Structure
- [ ] Create `src/navigation/RootNavigator.tsx`
- [ ] Create `src/navigation/types.ts` for typed navigation
- [ ] Define navigation param types for each screen
- [ ] Set up Stack Navigator for main flow

### 5.2 Deep Link Configuration
- [ ] Configure deep link scheme for iOS
- [ ] Configure deep link scheme for Android
- [ ] Set up linking configuration in React Navigation
- [ ] Implement deep link handler for share URLs
- [ ] Test deep links open correct list

---

## Phase 6: Core UI Screens

### 6.1 App Entry & Auth Flow
- [ ] Create `src/screens/LoadingScreen.tsx` - initial app load
- [ ] Implement auth state check on app launch
- [ ] Auto sign-in anonymously if no user
- [ ] Navigate to appropriate screen after auth

### 6.2 Home Screen
- [ ] Create `src/screens/HomeScreen.tsx`
- [ ] Add "Create New List" button
- [ ] Add text input for list name
- [ ] Implement list creation flow
- [ ] Navigate to list screen after creation
- [ ] Add "Join List" option (enter code manually)

### 6.3 Shopping List Screen
- [ ] Create `src/screens/ListScreen.tsx`
- [ ] Display list name in header
- [ ] Add share button in header
- [ ] Display items in scrollable list
- [ ] Add floating action button to add items
- [ ] Show empty state when no items
- [ ] Show loading state while fetching
- [ ] Show error state on failure

### 6.4 Item Components
- [ ] Create `src/components/ItemRow.tsx`
- [ ] Display item text
- [ ] Display checkbox for completed state
- [ ] Style completed items (strikethrough, dimmed)
- [ ] Add tap handler to toggle completed
- [ ] Add swipe-to-delete gesture
- [ ] Add swipe-to-edit gesture (or long press)
- [ ] Show sync indicator for pending items

### 6.5 Add/Edit Item
- [ ] Create `src/components/AddItemInput.tsx` - inline input at bottom
- [ ] Implement auto-focus when activated
- [ ] Implement submit on enter/done key
- [ ] Clear input after submit
- [ ] Create `src/components/EditItemModal.tsx` for editing
- [ ] Pre-populate modal with current item text
- [ ] Implement save and cancel actions

### 6.6 Share List
- [ ] Create `src/components/ShareSheet.tsx`
- [ ] Generate shareable deep link URL
- [ ] Display link with copy button
- [ ] Implement native share sheet integration
- [ ] Show QR code for link (optional)

### 6.7 Join List Flow
- [ ] Create `src/screens/JoinScreen.tsx` (deep link landing)
- [ ] Parse list token from URL
- [ ] Look up list by token
- [ ] Add current user as participant
- [ ] Navigate to list screen
- [ ] Handle invalid/expired token error

---

## Phase 7: Offline-First Support

### 7.1 Firestore Offline Configuration
- [ ] Enable Firestore offline persistence
- [ ] Configure cache size settings
- [ ] Test that reads work offline
- [ ] Test that writes queue offline

### 7.2 Optimistic UI
- [ ] Implement immediate UI update on add item
- [ ] Implement immediate UI update on toggle item
- [ ] Implement immediate UI update on delete item
- [ ] Show visual distinction for unsynced items
- [ ] Handle sync conflicts gracefully

### 7.3 Sync Status UI
- [ ] Create `src/components/SyncStatusBar.tsx`
- [ ] Show "Offline" banner when disconnected
- [ ] Show "Syncing..." indicator when pending writes
- [ ] Show "All changes saved" confirmation
- [ ] Animate transitions between states

### 7.4 Error Recovery
- [ ] Handle network errors on operations
- [ ] Implement retry logic for failed writes
- [ ] Show user-friendly error messages
- [ ] Allow manual retry of failed operations

---

## Phase 8: Testing

### 8.1 Test Setup
- [ ] Configure Jest for React Native
- [ ] Install React Native Testing Library
- [ ] Set up test utilities and mocks
- [ ] Create mock for Firebase modules
- [ ] Create mock for Zustand stores

### 8.2 Unit Tests - Services
- [ ] Test `auth.ts` - sign in, sign out, state changes
- [ ] Test `lists.ts` - CRUD operations
- [ ] Test `items.ts` - CRUD operations
- [ ] Test `participants.ts` - join, check membership
- [ ] Test utility functions

### 8.3 Unit Tests - Stores
- [ ] Test `authStore` - all actions and state transitions
- [ ] Test `listStore` - all actions and state transitions
- [ ] Test `itemsStore` - including optimistic updates
- [ ] Test `syncStore` - online/offline transitions

### 8.4 Component Tests
- [ ] Test `ItemRow` - render, interactions
- [ ] Test `AddItemInput` - input, submit
- [ ] Test `ShareSheet` - link generation, share action
- [ ] Test `SyncStatusBar` - status display

### 8.5 Security Rules Tests
- [ ] Write tests for list access rules
- [ ] Write tests for item write validation
- [ ] Write tests for owner-only operations
- [ ] Write tests for participant requirements
- [ ] Run tests with Firebase Emulator

### 8.6 Integration Tests
- [ ] Test full list creation flow
- [ ] Test full item CRUD flow
- [ ] Test join list via deep link flow
- [ ] Test offline/online sync flow

---

## Phase 9: Polish & Accessibility

### 9.1 Loading & Error States
- [ ] Add skeleton loaders for list screen
- [ ] Add pull-to-refresh on list screen
- [ ] Create reusable error boundary component
- [ ] Add retry buttons on error states
- [ ] Add empty state illustrations

### 9.2 Accessibility
- [ ] Add accessibility labels to all interactive elements
- [ ] Ensure proper focus order
- [ ] Test with screen reader (VoiceOver/TalkBack)
- [ ] Ensure sufficient color contrast
- [ ] Support dynamic text sizing

### 9.3 UI Polish
- [ ] Add haptic feedback on interactions
- [ ] Add smooth animations for list changes
- [ ] Add confirmation for destructive actions
- [ ] Ensure keyboard avoidance works correctly
- [ ] Test on various screen sizes

---

## Phase 10: Deployment

### 10.1 CI/CD Setup
- [ ] Create GitHub Actions workflow file
- [ ] Add lint check step
- [ ] Add TypeScript check step
- [ ] Add unit test step
- [ ] Add build verification step

### 10.2 Firebase Production Setup
- [ ] Switch Firestore to production security rules
- [ ] Enable Firebase Analytics
- [ ] Set up Sentry for error tracking
- [ ] Configure Firebase App Distribution for testing

### 10.3 iOS Deployment
- [ ] Configure app signing and certificates
- [ ] Create App Store Connect listing
- [ ] Prepare app screenshots
- [ ] Write app description and metadata
- [ ] Submit to TestFlight for beta testing

### 10.4 Android Deployment
- [ ] Configure app signing keystore
- [ ] Create Google Play Console listing
- [ ] Prepare app screenshots
- [ ] Write app description and metadata
- [ ] Submit to internal testing track

---

## Tier 2 Features (Post-MVP)

### Item Claiming
- [ ] Add `claimedBy` field UI
- [ ] Implement claim/unclaim action
- [ ] Show claimed items with user indicator
- [ ] Add filter to show "my claimed items"

### Multiple Lists
- [ ] Create lists overview screen
- [ ] Implement list switching
- [ ] Show list count on home screen
- [ ] Add list archive/delete from overview

### Quantity Field
- [ ] Add quantity input to add item flow
- [ ] Display quantity on item row
- [ ] Add quantity edit functionality
- [ ] Handle quantity in sync logic

### Optional Accounts
- [ ] Add email/password authentication
- [ ] Add Google OAuth authentication
- [ ] Add Apple Sign In
- [ ] Implement account upgrade flow (anonymous to account)
- [ ] Migrate anonymous data to account

---

## Notes
- MVP focuses on: shared lists, real-time sync, link sharing, offline support
- No accounts required for MVP (anonymous auth only)
- Conflict resolution: last-write-wins with server timestamps
- Target: <2s sync latency, works offline
