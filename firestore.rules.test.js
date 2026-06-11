/**
 * Firestore security rules unit tests — loot + lootDm
 *
 * Requires the Firebase emulator suite and rules-unit-testing:
 *   npm install --save-dev @firebase/rules-unit-testing
 *   firebase emulators:start --only firestore
 *   node --experimental-vm-modules node_modules/.bin/jest firestore.rules.test.js
 */

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');
const { doc, getDoc, setDoc, updateDoc, deleteDoc } = require('firebase/firestore');

const PROJECT_ID = 'dnd-test';
const CAMPAIGN = 'cos';
const ITEM_ID = 'item-1';

let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(() => env.cleanup());

// ── helpers ────────────────────────────────────────────────────────────────────

function lootRef(ctx) {
  return doc(ctx.firestore(), `campaigns/${CAMPAIGN}/loot/${ITEM_ID}`);
}
function lootDmRef(ctx) {
  return doc(ctx.firestore(), `campaigns/${CAMPAIGN}/lootDm/${ITEM_ID}`);
}

async function seedPublicItem() {
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), `campaigns/${CAMPAIGN}/loot/${ITEM_ID}`), {
      name: 'Glowing Longsword',
      subtitle: 'Unidentified',
      icon: 'sword',
      foundAt: 'Argynvostholt',
      quantity: 1,
      value: '??',
      claimBy: null,
      claimOpen: true,
      recordVisibility: 'public',
      createdBy: 'Tessa',
    });
  });
}

async function seedHiddenItem() {
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(), `campaigns/${CAMPAIGN}/loot/hidden-1`), {
      name: 'Secret Item',
      recordVisibility: 'dm',
      claimBy: null,
      claimOpen: false,
    });
  });
}

// ── visitor (logged out) ───────────────────────────────────────────────────────

describe('Visitor', () => {
  let visitor;
  beforeEach(() => { visitor = env.unauthenticatedContext(); });
  afterEach(() => visitor.cleanup());

  test('can read a public loot item', async () => {
    await seedPublicItem();
    await assertSucceeds(getDoc(lootRef(visitor)));
  });

  test('cannot read a hidden (dm) loot item', async () => {
    await seedHiddenItem();
    const ref = doc(visitor.firestore(), `campaigns/${CAMPAIGN}/loot/hidden-1`);
    await assertFails(getDoc(ref));
  });

  test('cannot write a loot item', async () => {
    await assertFails(setDoc(lootRef(visitor), { name: 'Test', recordVisibility: 'public' }));
  });

  test('cannot read lootDm', async () => {
    await assertFails(getDoc(lootDmRef(visitor)));
  });
});

// ── player (signed in, no DM claim) ───────────────────────────────────────────

describe('Player', () => {
  let player;
  beforeEach(() => {
    player = env.authenticatedContext('player-uid', { role: 'player' });
  });
  afterEach(() => player.cleanup());

  test('can read public loot', async () => {
    await seedPublicItem();
    await assertSucceeds(getDoc(lootRef(player)));
  });

  test('can create a public loot item', async () => {
    const ref = doc(player.firestore(), `campaigns/${CAMPAIGN}/loot/new-item`);
    await assertSucceeds(setDoc(ref, {
      name: 'Gold Ring',
      subtitle: 'Plain band',
      icon: 'coin',
      foundAt: 'Death House',
      quantity: 1,
      value: '25 gp',
      claimBy: null,
      claimOpen: true,
      recordVisibility: 'public',
      createdBy: 'player-uid',
    }));
  });

  test('cannot create a dm-only loot item', async () => {
    const ref = doc(player.firestore(), `campaigns/${CAMPAIGN}/loot/secret-item`);
    await assertFails(setDoc(ref, {
      name: 'Hidden Dagger',
      recordVisibility: 'dm',
      claimBy: null,
      claimOpen: false,
    }));
  });

  test('can claim an unclaimed loot item', async () => {
    await seedPublicItem();
    await assertSucceeds(updateDoc(lootRef(player), {
      claimBy: 'Tessa',
      claimOpen: false,
      updatedAt: new Date(),
    }));
  });

  test('cannot change recordVisibility', async () => {
    await seedPublicItem();
    await assertFails(updateDoc(lootRef(player), { recordVisibility: 'dm' }));
  });

  test('cannot read lootDm', async () => {
    await assertFails(getDoc(lootDmRef(player)));
  });

  test('cannot write lootDm', async () => {
    await assertFails(setDoc(lootDmRef(player), { trueIdentity: 'Sunsword' }));
  });
});

// ── DM (admin, role == 'dm') ───────────────────────────────────────────────────

describe('DM', () => {
  let dm;
  beforeEach(() => {
    dm = env.authenticatedContext('dm-uid', { role: 'dm' });
  });
  afterEach(() => dm.cleanup());

  test('can read any loot item including hidden', async () => {
    await seedHiddenItem();
    const ref = doc(dm.firestore(), `campaigns/${CAMPAIGN}/loot/hidden-1`);
    await assertSucceeds(getDoc(ref));
  });

  test('can create a dm-only loot item', async () => {
    const ref = doc(dm.firestore(), `campaigns/${CAMPAIGN}/loot/dm-item`);
    await assertSucceeds(setDoc(ref, {
      name: 'Mystery Artifact',
      recordVisibility: 'dm',
      claimBy: null,
      claimOpen: false,
    }));
  });

  test('can edit any field including recordVisibility', async () => {
    await seedPublicItem();
    await assertSucceeds(updateDoc(lootRef(dm), { recordVisibility: 'dm', updatedAt: new Date() }));
  });

  test('can delete a loot item', async () => {
    await seedPublicItem();
    await assertSucceeds(deleteDoc(lootRef(dm)));
  });

  test('can read lootDm', async () => {
    await env.withSecurityRulesDisabled(async ctx => {
      await setDoc(doc(ctx.firestore(), `campaigns/${CAMPAIGN}/lootDm/${ITEM_ID}`), {
        trueIdentity: 'The Sunsword — do not reveal',
      });
    });
    await assertSucceeds(getDoc(lootDmRef(dm)));
  });

  test('can write lootDm', async () => {
    await assertSucceeds(setDoc(lootDmRef(dm), { trueIdentity: 'Holy Symbol of Ravenkind' }));
  });
});
