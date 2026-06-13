# The Tome — Curse of Strahd Campaign Manager

React + Firebase app for managing a D&D campaign. Built for one DM and multiple players.

## Roles

| Role | How it's set |
|------|-------------|
| **Visitor** | Not signed in |
| **Player** | Signed in; default on first login (`role: 'player'` in `/users/{uid}`) |
| **DM** | Signed in with `role: 'dm'` in their user document |

---

## Permissions Matrix

**R** = Read · **C** = Create · **U** = Update · **D** = Delete · **—** = no access

| Record | Visitor | Player | DM |
|--------|---------|--------|----|
| **Characters** (visibility: `players`) | — | R | R · C · U · D |
| **Characters** (visibility: `hidden`) | — | — | R · C · U · D |
| **My Character** (own PC) | — | R · C · U | R · C · U · D |
| **Locations** (visibility: `players`) | — | R · C · U | R · C · U · D |
| **Locations** (visibility: `hidden`) | — | — | R · C · U · D |
| **Quests** (visibility: `players`) | — | R · C · U | R · C · U · D |
| **Quests** (visibility: `hidden`) | — | — | R · C · U · D |
| **Notes** (scope: `pub`) | R | R · C | R · C · U · D |
| **Notes** (scope: `priv`) | — | R · C (own only) | R · C · U · D |
| **Notes** (scope: `dm`) | — | — | R · C · U · D |
| **Timeline** (hidden: `false`) | — | R · C · U | R · C · U · D |
| **Timeline** (hidden: `true`) | — | — | R · C · U · D |
| **Loot** (visibility: `public`) | — | R · C · U | R · C · U · D |
| **Loot** (visibility: `hidden`) | — | — | R · C · U · D |
| **Loot DM Secrets** (`lootDm/`) | — | — | R · C · U · D |
| **User Profile** | — | R (own + others) | R · all |
| **Presence** | — | R (all) · W (own) | R · W · all |

---

## How Records Are Created

All writes go directly to Firestore via the Firebase SDK — there is no REST API layer.

| Record | Method | Notes |
|--------|--------|-------|
| **Characters / NPCs** | `addDoc(collection(db, 'campaigns/{id}/characters'), data)` | Includes `authorId` and `createdAt: serverTimestamp()`. `sortOrder` is auto-calculated at save time. |
| **My Character (PC)** | `setDoc(doc(db, '…/characters', userId), data, { merge: true })` | Doc ID = the player's Firebase UID. Players can only write their own document. |
| **Locations** | `addDoc(…/locations, data)` | `parentId` links to a parent location for hierarchy. `sortOrder` is max existing + 1. |
| **Quests** | `addDoc(…/quests, data)` | First load triggers `writeBatch()` seed data if collection is empty. |
| **Notes** | `addDoc(…/notes, data)` | `entityId` + `entityType` attach the note to any record. `scope` must be `'pub'`, `'priv'`, or `'dm'`. |
| **Timeline Entries** | `addDoc(…/timeline, data)` | `order: Date.now()` controls sort. Seed entries are batch-written on first load. |
| **Loot** | `addDoc(…/loot, data)` | If a DM note is included, a parallel `setDoc(…/lootDm/{itemId}, { trueIdentity })` is written to a separate DM-only collection. |
| **User Profile** | `setDoc(…/users/{uid}, data)` | Auto-created on first sign-in via `onAuthStateChanged`. Default `role: 'player'`. |

---

## Visibility & Scope Fields

Most records use a `visibility` field to control player access:

- `'players'` — visible to all signed-in users
- `'hidden'` — DM-only

Notes use a `scope` field instead:

- `'pub'` — public; readable even by visitors
- `'priv'` — readable only by the author and the DM
- `'dm'` — DM-only

DM-only content within a record (e.g., `character.secret`, `quest.secret`) is stored on the document itself but gated at the Firestore rules level so players never receive those fields. Loot is the exception — its DM notes are stored in a separate `lootDm/` collection entirely.
