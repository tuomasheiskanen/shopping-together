# Project Overview: Shared Event Shopping App (ShoppingTogether)

## 1. Summary

**ShoppingTogether** is a lightweight mobile and web application that helps families and friends coordinate shared shopping responsibilities for events such as holidays, dinner parties, and trips.

The app focuses on **clarity, real-time collaboration, offline-first usability, and minimal onboarding**, making it suitable for both tech-savvy and non-technical users.

---

## 2. Goals

### Core Goal

Enable multiple users to collaborate on a single shopping list in near real time, preventing duplicate purchases and forgotten items.

### Supporting Goals

* Zero-friction collaboration via shareable links
* Clear responsibility via item claiming
* Reliable offline usage with automatic sync
* Accessibility across age groups and devices
* Low infrastructure cost during validation

---

## 3. Feature Scope

### MVP (Tier 1)

* Shared shopping lists
* Real-time updates
* Add / edit / check off items
* Link-based sharing (no mandatory accounts)
* Simple, accessible list UI
* Offline-first support with auto-sync

### Tier 2 (Post-MVP)

* Item claiming
* Multiple lists
* Quantity field
* Persistent lists across sessions
* Basic categorization
* Optional account system

### Tier 3 (Expansion)

* List templates and reuse
* Archives
* UI personalization
* Cross-event aggregation

---

## 4. Explicit Non-Goals

* Recipes or meal planning
* Store or coupon integrations
* Payments or checkout
* Chat or social feeds
* AI recommendations
* Gamification
* Barcode scanning

---

## 5. Target Users

* Families coordinating groceries
* Friends planning shared events
* Mixed iOS / Android users
* Users currently relying on messaging apps or shared notes

---

## 6. Identity & Access Model

The app uses a **progressive identity model**:

### Identity Levels

1. **Anonymous Participant (default)**

   * Created automatically when opening a list link
   * Device-bound
   * Can read and write list items
   * No recovery if local storage is lost

2. **List Owner (implicit)**

   * Creator of the list
   * Can regenerate share links
   * Can archive or delete lists

3. **Account-Backed User (optional)**

   * Email or OAuth login
   * Enables multi-device continuity
   * Preserves ownership and contributions

Anonymous users may upgrade to an account without losing data.

---

## 7. Sharing & Permissions

* Lists are shared via a single write-enabled link
* Anyone with the link can read and write items
* Only the owner can regenerate the link or delete the list
* No read-only roles in MVP

---

## 8. Conflict Resolution Philosophy

The system prioritizes **predictability over correctness**.

* Last-write-wins using server timestamps
* Field-level resolution where possible
* Offline edits replay automatically
* Conflicts may overwrite silently
* No conflict dialogs or merge UIs in MVP

Claims are best-effort and not strongly consistent.

---

## 9. Technical Stack

### Frontend

* React Native (iOS & Android)
* TypeScript
* Zustand for state management
* Accessible, native-feeling UI

### Backend

* Firebase platform
* **Cloud Firestore** (primary database)
* Firebase Authentication (anonymous + optional accounts)
* Firebase Cloud Functions
* Firebase Hosting
* Firebase Analytics + Sentry

---

## 10. Firestore Data Model

### Collections

#### `/lists/{listId}`

* `name`
* `ownerId`
* `linkToken`
* `createdAt`
* `archived`

#### `/lists/{listId}/participants/{participantId}`

* `joinedAt`
* `type` (anonymous | account)

#### `/lists/{listId}/items/{itemId}`

* `text`
* `quantity`
* `claimedBy`
* `completed`
* `updatedAt`

---

## 11. Firestore Security Rules

* All users must be authenticated (anonymous or account)
* Access is granted via participant document existence
* Owners control destructive actions
* No cross-list access
* Shape validation enforced on writes

(Security rules are versioned, tested with the emulator, and treated as first-class code.)

---

## 12. Offline Sync & Real-Time Behavior

* Firestore offline persistence enabled
* Optimistic UI updates
* Snapshot listeners for real-time updates
* Writes queued offline and replayed automatically
* Server timestamps determine authoritative state

No undo, rollback, or conflict UI in MVP.

---

## 13. Development & Ops

* GitHub repository
* GitHub Actions CI/CD
* Jest + React Native Testing Library
* Semantic versioning

---

## 14. Success Metrics

* ≥70% of first-session users share a list
* ≥60% of lists have multiple contributors
* <2s sync latency
* ≥30% 30-day retention
* <$20/month per 10K users

---

## 15. Current Status

* Architecture finalized
* Database choice locked (Firestore)
* Security rules defined
* Offline behavior specified
* Ready for implementation
