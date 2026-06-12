// Run once: node scripts/seed-timeline.js
// Seeds the static timeline data into Firestore. Safe to re-run — skips if data already exists.

require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

const TIMELINE = [
  { id: 'sX',  order: 13, session: 'Unwritten',    day: '—',                          kind: 'dramatic', hidden: true,
    title: 'The Amber Temple Beckons',
    body: 'A thread not yet lived — visible only to the keeper of secrets.',
    links: [{ n: 'Amber Temple', t: 'pin' }],
    author: 'DM prep',
    dmNote: "When the party seeks the Sunsword, route them here. The dark gifts of the Amber Temple are the campaign's great temptation — let a player be offered one.",
  },
  { id: 's12', order: 12, session: 'Session 12',    day: 'Day 7 — Waning of the Crow Moon', kind: 'now',
    title: 'Bread and Omens at the Blue Water Inn',
    body: 'The party took refuge at the Blue Water Inn as Vallaki readied another of its desperate festivals. Over paprikash and watered wine, Urwin Martikov grew guarded at the mention of ravens — and Ireena, sleepless, confessed she dreams of the castle every night now.',
    links: [
      { n: 'Blue Water Inn',      t: 'pin'            },
      { n: 'Ireena Kolyana',      t: 'user', c: 'p'   },
      { n: 'Urwin Martikov',      t: 'user'            },
      { n: 'Free the Soul Coins', t: 'quest', c: 'q'  },
    ],
    author: 'Logged by Tessa',
    dmNote: 'Next session: the ambush at the gates the instant they try to escort Ireena out. Plant one wereraven feather in her room as foreshadowing.',
  },
  { id: 's11', order: 11, session: 'Session 11',    day: 'Day 4',                      kind: 'dramatic',
    title: 'The Bones Are Gone',
    body: "Father Lucian met them ashen-faced: the relics of St. Andral had been stolen from beneath the altar. Without them, the church's ancient protection would fail before the festival's end. The party fanned out into Vallaki's suspicious streets, the clock already running.",
    links: [
      { n: "St. Andral's Church", t: 'pin'            },
      { n: 'Father Lucian',       t: 'user'            },
      { n: 'The Stolen Bones',    t: 'quest', c: 'q'  },
    ],
    author: 'Logged by Greg',
    dmNote: "Henrik hid the bones in a crate in his coffin shop. If they fail, run the spawn ambush at the festival as written — it should feel like a genuine loss.",
  },
  { id: 's10', order: 10, session: 'Session 10',    day: 'Day 1',                      kind: 'milestone',
    title: 'Through the Gates of Vallaki',
    body: 'After days on the Old Svalich Road, the party passed beneath the banners of Vallaki — "All Will Be Well" — and into the brittle cheer of the Burgomaster\'s rule. They had brought Ireena out of the village of Barovia alive. It felt, briefly, like progress.',
    links: [
      { n: 'Vallaki',        t: 'pin'            },
      { n: 'Ireena Kolyana', t: 'user', c: 'p'   },
      { n: 'Escort Ireena',  t: 'quest', c: 'q'  },
    ],
    author: 'Logged by the DM',
  },
  { id: 's09', order: 9,  session: 'Session 9',     day: 'Eve of departure',           kind: '',
    title: 'The Reading at Tser Pool',
    body: "In a firelit tent among the Vistani, Madam Eva turned the Tarokka cards and set the party's course: a holy symbol, a sword of light, a tome of secrets, an ally, and the place of the final reckoning. The cards do not lie. They merely wait.",
    links: [
      { n: 'Madam Eva',               t: 'user'           },
      { n: 'Tser Pool',               t: 'pin'            },
      { n: 'Seek the Three Treasures', t: 'quest', c: 'q' },
    ],
    author: 'Logged by the DM',
    dmNote: 'Record the actual card draws here so the artifact locations stay consistent all campaign. Sword → Amber Temple. Symbol → Wachterhaus. Tome → Ravenloft study.',
  },
  { id: 's08', order: 8,  session: 'Sessions 1–8',  day: 'Days of the Death House',    kind: 'milestone',
    title: 'Out of the Mists',
    body: "It began, as these things do, with a wrong turn and a rising fog. The party awoke on the Svalich Road with no memory of arriving, found the cursed Death House, and survived it — barely. By the time they reached the village of Barovia and met grieving Ireena and her brother Ismark, Barovia had already closed around them like a fist.",
    links: [
      { n: 'Death House',        t: 'pin'  },
      { n: 'Village of Barovia', t: 'pin'  },
      { n: 'Ismark Kolyanovich', t: 'user' },
    ],
    author: 'Logged by the DM',
  },
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const col = collection(db, 'campaigns', CAMPAIGN_ID, 'timeline');
  const existing = await getDocs(col);

  if (!existing.empty) {
    console.log(`Timeline already has ${existing.size} entries — skipping seed.`);
    console.log('To re-seed, delete the timeline collection in Firestore first.');
    process.exit(0);
  }

  const batch = writeBatch(db);
  for (const entry of TIMELINE) {
    const { id, ...data } = entry;
    batch.set(doc(col, id), data);
  }
  await batch.commit();

  console.log(`Seeded ${TIMELINE.length} timeline entries into campaigns/${CAMPAIGN_ID}/timeline`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
