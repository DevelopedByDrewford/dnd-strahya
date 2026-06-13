import { useState, useEffect, useMemo } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

const QUEST_SEED = [
  { id: 'soul-coins',
    name: 'Free the Soul Coins', status: 'active', by: 'Tessa', visibility: 'players',
    giver: 'Ireena Kolyana', location: 'Vallaki',    desc: 'The Abbot of Krezk holds a clutch of soul coins — spirits bound in cursed silver. Ireena begged the party to free them before the next full moon, when the Abbot means to use them in his mad work.',
    subs: [
      { t: 'Recover the first coin from Old Bonegrinder', done: true },
      { t: 'Bargain with the Abbot of Krezk',             done: false, deadline: 'over' },
      { t: 'Return the freed souls to rest at the church', done: false },
    ],
    rewards: ["Ireena's trust", 'A blessing of the Morninglord'],
    links: [
      { n: 'Ireena Kolyana', t: 'Quest giver', i: 'user' },
      { n: 'Krezk',          t: 'Location',   i: 'pin'  },
      { n: 'The Abbot',      t: 'Character',  i: 'user' },
    ],
    secret: "Each freed soul weakens the Abbot's hold on Vasilka, his \"bride.\" Free all three and he turns hostile — but may gift the party the holy symbol if calmed first.",
  },
  { id: 'stolen-bones',
    name: 'The Stolen Bones of St. Andral', status: 'active', by: 'DM', visibility: 'players',
    giver: 'Father Lucian', location: 'Vallaki',    desc: "The bones of St. Andral have vanished from beneath the church. Without them, the consecration fails — and on the night of the festival, the church's wards will fall.",
    subs: [
      { t: 'Question Father Lucian',                done: true  },
      { t: 'Track down Henrik van der Voort',       done: false },
      { t: 'Recover the bones before the festival', done: false, deadline: 'soon' },
    ],
    rewards: ['Sanctuary of the church', "Father Lucian's aid"],
    links: [
      { n: "St. Andral's Church", t: 'Location',    i: 'pin'  },
      { n: 'Father Lucian',       t: 'Quest giver', i: 'user' },
    ],
    secret: "Strahd orchestrated the theft. If the bones aren't recovered, his spawn ambush the festival — a deadly set-piece. Henrik hid the bones in a crate in his coffin shop.",
  },
  { id: 'escort-ireena',
    name: 'Escort Ireena to Safety', status: 'active', by: 'Aldric', visibility: 'players',
    giver: 'Ismark Kolyanovich', location: 'Krezk',    desc: "Ismark wants his sister beyond Strahd's reach. The walled village of Krezk, blessed by the Abbey, may be the only refuge in Barovia — if its suspicious gatekeepers can be convinced to open the gates.",
    subs: [
      { t: 'Earn entry to Krezk',             done: false },
      { t: 'Secure lodging within the walls', done: false },
    ],
    rewards: ["Ismark's loyalty"],
    links: [
      { n: 'Ireena Kolyana', t: 'Escort',      i: 'user' },
      { n: 'Krezk',          t: 'Destination', i: 'pin'  },
    ],
    secret: "Krezk is not as safe as it seems — Strahd visits the Abbey freely. Ireena is never truly beyond his reach until her soul is released.",
  },
  { id: 'wizard-wines',
    name: 'Wizard of Wines', status: 'active', by: 'Greg', visibility: 'players',
    giver: 'Urwin Martikov', location: 'Blue Water Inn',    desc: "The region's only winery has gone silent and the wine — Barovia's one small comfort — has stopped flowing. Urwin will say only that it is \"a family matter.\"",
    subs: [
      { t: 'Travel to the Wizard of Wines',  done: false },
      { t: 'Drive out whatever has taken it', done: false },
      { t: 'Recover the stolen gems',         done: false },
    ],
    rewards: ['Wereraven allies', 'Free passage through Keeper territory'],
    links: [
      { n: 'Urwin Martikov', t: 'Quest giver', i: 'user' },
      { n: 'Blue Water Inn', t: 'Location',    i: 'pin'  },
    ],
    secret: 'The Martikovs are wereravens. Completing this earns the Keepers of the Feather as allies — invaluable for the endgame.',
  },
  { id: 'tarokka',
    name: 'Seek the Three Treasures', status: 'completed', by: 'DM', visibility: 'players',
    giver: 'Madam Eva', location: 'Tser Pool',    desc: "Madam Eva's Tarokka reading set the party on the hunt for the three artifacts that can end Strahd: a holy symbol, a sword of light, and the Tome of Strahd.",
    subs: [
      { t: 'Receive the Tarokka reading', done: true },
      { t: 'Recover the Tome of Strahd',  done: true },
    ],
    rewards: ['The Tome of Strahd', 'Foreknowledge of the artifacts'],
    links: [
      { n: 'Madam Eva',      t: 'Seer',     i: 'user' },
      { n: 'Tome of Strahd', t: 'Artifact', i: 'book' },
    ],
    secret: 'The reading is randomized per campaign. Record the actual card results here so the locations stay consistent.',
  },
  { id: 'true-name',
    name: 'The Whispered Name', status: 'active', by: 'DM', visibility: 'hidden',
    giver: '—', location: 'Amber Temple',    desc: 'A secret thread only the DM can see — not yet surfaced to the players.',
    subs: [
      { t: 'Seed the rumor at the Blue Water Inn', done: false },
    ],
    rewards: ['Story revelation'],
    links: [
      { n: 'Amber Temple', t: 'Location', i: 'pin' },
    ],
    secret: "Plant this only if the party investigates the Amber Temple. Tie it to the Sunsword's true name to give the finale weight.",
  },
];

export function useQuests({ userId = null, isDM = false } = {}) {
  const [firestoreQuests, setFirestoreQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'quests');
    const q = isDM
      ? col
      : query(col, where('visibility', '==', 'players'));
    const unsub = onSnapshot(q,
      snap => {
        if (!active) return;
        const qs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        qs.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
        setFirestoreQuests(qs);
        setLoading(false);
      },
      err => { if (!active) return; setLoading(false); setError(err); },
    );
    return () => { active = false; unsub(); };
  }, [isDM]);

  const quests = useMemo(() => firestoreQuests.map(q => ({
    id: q.id,
    name: q.name,
    status: q.status || 'active',
    by: q.by || '—',
    byYou: !!userId && q.authorId === userId,
    giver: q.giver || '—',
    location: q.location || '—',
    desc: q.desc || '',
    subs: q.subs || [],
    rewards: q.rewards || [],
    links: q.links || [],
    secret: q.secret || '',
    dm: q.visibility === 'hidden',
    firestore: true,
  })), [firestoreQuests, userId]);

  async function addQuest(data) {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'quests');
    return addDoc(col, { ...data, authorId: userId, createdAt: serverTimestamp() });
  }

  async function updateQuest(id, data) {
    return updateDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'quests', id), data);
  }

  async function deleteQuest(id) {
    return deleteDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'quests', id));
  }

  async function seedQuests() {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'quests');
    const batch = writeBatch(db);
    for (const { id, ...data } of QUEST_SEED) {
      batch.set(doc(col, id), { ...data, createdAt: serverTimestamp() });
    }
    return batch.commit();
  }

  return {
    quests, loading, error,
    seeded: firestoreQuests.length > 0,
    addQuest, updateQuest, deleteQuest, seedQuests,
  };
}
