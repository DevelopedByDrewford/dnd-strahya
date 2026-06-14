import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

// NPCs only — player characters are managed via the My Character tab.
const CHARACTER_SEED = [
  { id: 'strahd',  group: 'Enemies', sortOrder: 0,
    name: 'Strahd von Zarovich', sub: 'The Devil of Barovia, Lord of Ravenloft',
    rosterRole: 'The Devil of Barovia', dot: 'bad', visibility: 'players',
    portrait: 'Pale aristocrat · crimson cloak',
    statuses: [
      { t: 'Vampire', i: 'vampire', c: 'bad' },
      { t: 'Cursed',  i: 'curse',   c: 'bad' },
      { t: 'Hostile', i: 'alert',   c: 'bad' },
    ],
    facts: [
      { k: 'Type',    v: 'Undead'       },
      { k: 'Faction', v: 'Dark Powers', link: true },
      { k: 'Seat',    v: 'Ravenloft',   link: true },
      { k: 'Status',  v: 'Active'       },
    ],
    appearance: [
      'A tall, handsome man of regal bearing, his skin pale as the moon and his eyes black and bottomless. He dresses in the fashion of a bygone age — a crimson-lined cloak, a signet of the Von Zarovich line upon his finger.',
      'He is unfailingly courteous, a gracious host even to those he intends to destroy. His voice is soft. His patience is centuries deep.',
    ],
    personality: 'Possessive, proud, and profoundly lonely. He mistakes obsession for love and sees the party as pieces in a game he has played a thousand times.',
    secret: "Strahd cannot leave Barovia — the mists are his prison as much as his domain. He seeks in Ireena the reincarnation of Tatyana. The Tarokka reading determines his weaknesses' locations.",
    tactics: "Opens with charm and hospitality. Uses the castle's Heart of Sorrow to negate damage. Retreats into mist at 1/3 HP to strike again at dawn's opposite.",
    statblock: {
      cr: '15', ac: '16 (natural armor)', hp: '144 (17d8+68)', speed: '30 ft.',
      abilities: [
        { stat: 'STR', val: '18', mod: '+4' }, { stat: 'DEX', val: '18', mod: '+4' }, { stat: 'CON', val: '18', mod: '+4' },
        { stat: 'INT', val: '20', mod: '+5' }, { stat: 'WIS', val: '15', mod: '+2' }, { stat: 'CHA', val: '18', mod: '+4' },
      ],
      traits: [
        { n: 'Regeneration',       d: "Regains 20 HP at the start of his turn if he has at least 1 HP and isn't in sunlight or running water." },
        { n: 'Vampire Weaknesses', d: 'Forbiddance, harmed by running water, stake to the heart, sunlight hypersensitivity.' },
        { n: 'Spider Climb',       d: 'Can climb difficult surfaces, including upside down, without an ability check.' },
      ],
    },
    rels: [
      { n: 'Ireena Kolyana',   t: 'Obsession',     id: 'ireena'   },
      { n: 'Rahadin',          t: 'Loyal servant', id: 'rahadin'  },
      { n: 'Castle Ravenloft', t: 'Domain',        id: 'ravenloft' },
    ],
    notes: [
      { scope: 'pub',  who: 'Greg', when: '2d', body: "He let us walk out of the castle alive. That wasn't mercy — it was a message." },
      { scope: 'priv', who: 'You',  when: '4d', body: 'Sunlight + running water. If we can corner him near the falls at dawn…' },
      { scope: 'dm',   who: 'DM',   when: '1w', body: "Card reading placed the Sunsword in the Amber Temple. Don't let them rush Ravenloft before they have it." },
    ],
  },

  { id: 'rahadin', group: 'Enemies', sortOrder: 1,
    name: 'Rahadin', sub: 'Chamberlain of Ravenloft',
    rosterRole: 'Chamberlain', dot: 'bad', visibility: 'players',
    portrait: 'Desert elf · cold eyes',
    statuses: [{ t: 'Hostile', i: 'alert', c: 'bad' }],
    facts: [
      { k: 'Type',    v: 'Desert Elf'   },
      { k: 'Faction', v: 'Strahd',      link: true },
      { k: 'Seat',    v: 'Ravenloft',   link: true },
      { k: 'Status',  v: 'Active'       },
    ],
    appearance: ['A lean desert elf of ancient years, his face an expressionless mask. He moves without sound and carries himself with the authority of one who has served a vampire lord for centuries.'],
    personality: 'Utterly loyal, utterly merciless. He feels no emotion beyond contempt for those who threaten his master.',
    secret: "Rahadin carries the psychic screams of everyone he has ever killed — thousands of voices that only he can hear. He is functionally immune to fear as a result. He can be found in Ravenloft's entry hall and will hunt the party relentlessly if they harm Strahd.",
    tactics: 'Multi-attack with scimitar. Uses his Deathly Choir feature to incapacitate multiple enemies at once. Fights to the death defending Strahd.',
    statblock: {
      cr: '10', ac: '18 (studded leather)', hp: '135 (18d8+54)', speed: '35 ft.',
      abilities: [
        { stat: 'STR', val: '14', mod: '+2' }, { stat: 'DEX', val: '22', mod: '+6' }, { stat: 'CON', val: '17', mod: '+3' },
        { stat: 'INT', val: '15', mod: '+2' }, { stat: 'WIS', val: '14', mod: '+2' }, { stat: 'CHA', val: '15', mod: '+2' },
      ],
      traits: [
        { n: 'Deathly Choir', d: 'Each creature within 10 ft. that can hear Rahadin must succeed on a DC 16 Wisdom save or be frightened and incapacitated.' },
        { n: 'Evasion',       d: 'If subject to an effect that allows a Dex save for half damage, takes no damage on success.' },
      ],
    },
    rels: [{ n: 'Strahd von Zarovich', t: 'Master', id: 'strahd' }],
    notes: [],
  },

  { id: 'vasili',  group: 'Hidden', sortOrder: 2,
    name: 'Vasili von Holtz', sub: 'A charming Barovian nobleman — or so he claims',
    rosterRole: "Strahd's alias", dot: 'bad', visibility: 'hidden',
    portrait: 'Affable noble · too-perfect smile',
    statuses: [{ t: 'Concealed', i: 'curse', c: 'bad' }],
    facts: [
      { k: 'Type',    v: 'Undead (disguised)' },
      { k: 'Faction', v: 'Dark Powers', link: true },
      { k: 'Status',  v: 'Active'              },
    ],
    appearance: ['A handsome, well-dressed Barovian who introduces himself as a minor noble traveling the valley. His manner is warm, his interest in the party flattering — and deeply unsettling once you know the truth.'],
    personality: 'Exactly like Strahd, but with the cruelty filed off. He is testing the party in a form they are less likely to attack on sight.',
    secret: "Vasili IS Strahd. This alias lets him walk among the party before they know his face. Use him to seed false trust — invite them to dinner, offer help, then reveal the truth at the most damaging moment.",
    tactics: 'Never fights as Vasili. Retreats before combat and reappears as Strahd.',
    statblock: null,
    rels: [{ n: 'Strahd von Zarovich', t: 'Is the same person', id: 'strahd' }],
    notes: [{ scope: 'dm', who: 'DM', when: '—', body: "Reveal only after the party has trusted him. The dinner invitation at Ravenloft works best." }],
  },

  { id: 'ireena',  group: 'Allies', sortOrder: 3,
    name: 'Ireena Kolyana', sub: 'Adopted daughter of the late Burgomaster',
    rosterRole: "Strahd's obsession", dot: 'good', visibility: 'players',
    portrait: 'Auburn hair · iron will',
    statuses: [
      { t: 'Hunted',   i: 'alert',  c: 'bad'  },
      { t: 'Resolute', i: 'shield', c: 'good' },
    ],
    facts: [
      { k: 'Type',     v: 'Human'              },
      { k: 'Faction',  v: '—'                  },
      { k: 'Location', v: 'Vallaki', link: true },
      { k: 'Status',   v: 'Alive'               },
    ],
    appearance: ["A striking young woman with auburn hair and a fierce, steady gaze. Grief over her father has hardened into resolve. She refuses to be anyone's prize — least of all Strahd's."],
    personality: 'Brave to the point of stubbornness. Protective of the party that protects her, but chafes at being treated as cargo to be escorted.',
    secret: "Ireena is the latest reincarnation of Tatyana, Strahd's lost love. The puncture wounds on her neck mark his growing hold. Sergei's spirit at the Krezk pool may finally free her soul.",
    tactics: '',
    statblock: null,
    rels: [
      { n: 'Ismark Kolyanovich',  t: 'Brother',    id: 'ismark' },
      { n: 'Strahd von Zarovich', t: 'Pursued by', id: 'strahd' },
    ],
    notes: [
      { scope: 'pub', who: 'Marian', when: '1d', body: "She insisted on keeping her own blade. Good. She'll need it." },
      { scope: 'dm',  who: 'DM',     when: '3d', body: 'If she reaches the Krezk pool and meets Sergei, run the release scene.' },
    ],
  },

  { id: 'ismark',  group: 'Allies', sortOrder: 4,
    name: 'Ismark Kolyanovich', sub: "Son of the late Burgomaster of Barovia",
    rosterRole: "Burgomaster's son", dot: 'good', visibility: 'players',
    portrait: 'Broad-shouldered · weary eyes',
    statuses: [{ t: 'Grieving', i: 'heart', c: 'good' }],
    facts: [
      { k: 'Type',     v: 'Human'                        },
      { k: 'Location', v: 'Village of Barovia', link: true },
      { k: 'Status',   v: 'Alive'                         },
    ],
    appearance: ['A broad-shouldered man worn thin by grief and sleepless nights guarding his sister. He carries himself like someone who knows how to fight but wishes he did not have to.'],
    personality: "Earnest and honourable to a fault. He blames himself for his father's death and will do anything to see Ireena safe — including trusting strangers from beyond the mists.",
    secret: 'Ismark knows more about the village\'s history with Strahd than he lets on. He can share the Kolyana family journal if the party earns his full trust.',
    tactics: '',
    statblock: null,
    rels: [{ n: 'Ireena Kolyana', t: 'Sister', id: 'ireena' }],
    notes: [],
  },

  { id: 'urwin',   group: 'Allies', sortOrder: 5,
    name: 'Urwin Martikov', sub: 'Innkeeper of the Blue Water Inn',
    rosterRole: 'Innkeeper', dot: 'good', visibility: 'players',
    portrait: 'Burly · careful eyes',
    statuses: [{ t: 'Guarded', i: 'shield', c: 'good' }],
    facts: [
      { k: 'Type',     v: 'Wereraven (secret)'              },
      { k: 'Faction',  v: 'Keepers of the Feather', link: true },
      { k: 'Location', v: 'Blue Water Inn',          link: true },
      { k: 'Status',   v: 'Alive'                            },
    ],
    appearance: ['A burly, careful man who runs the Blue Water Inn with practiced hospitality. His eyes miss nothing. He goes quiet around the subject of ravens.'],
    personality: "Warm but guarded. He will help the party — but only once he is sure they can be trusted. Family comes before everything.",
    secret: "Urwin is a wereraven and a leader of the Keepers of the Feather, a resistance network hidden throughout Barovia. The stolen winery gem is his family's heirloom, and recovering it will unlock the Keepers as allies.",
    tactics: 'Fights in hybrid form if cornered. Would rather flee and regroup.',
    statblock: null,
    rels: [{ n: 'Blue Water Inn', t: 'Proprietor', id: 'blue-water-inn' }],
    notes: [{ scope: 'dm', who: 'DM', when: '—', body: 'Reveal wereraven nature only after Wizard of Wines quest is complete.' }],
  },
];

export function useCharacters({ isDM = false } = {}) {
  const [firestoreChars, setFirestoreChars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'characters');
    const q = isDM
      ? col
      : query(col, where('visibility', '==', 'players'));
    const unsub = onSnapshot(q,
      snap => {
        if (!active) return;
        const chars = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        chars.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setFirestoreChars(chars);
        setLoading(false);
      },
      err => { if (!active) return; setLoading(false); setError(err); },
    );
    return () => { active = false; unsub(); };
  }, [isDM]);

  const mergedRoster = useMemo(() => {
    if (firestoreChars.length === 0) return [];

    const groupMap = {};
    for (const ch of firestoreChars) {
      const grp = (ch.group === 'Camp Companion' ? 'Camp Companions' : ch.group) || 'Allies';
      if (!groupMap[grp]) {
        groupMap[grp] = { grp, dm: ch.visibility === 'hidden', items: [] };
      }
      groupMap[grp].items.push({
        id: ch.id,
        n: ch.name,
        r: ch.rosterRole || ch.sub || '',
        dot: ch.dot || 'neutral',
        dm: ch.visibility === 'hidden',
        firestore: true,
      });
    }
    const GROUP_ORDER = ['Hidden', 'The Party', 'Camp Companions', 'Allies', 'Neutral', 'Enemies'];
    return Object.values(groupMap).sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a.grp);
      const bi = GROUP_ORDER.indexOf(b.grp);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [firestoreChars]);

  const getChar = useCallback((id) => {
    const fs = firestoreChars.find(c => c.id === id);
    if (fs) {
      const isParty = fs.group === 'The Party';

      function abMod(score) {
        const n = parseInt(score) || 10;
        const m = Math.floor((n - 10) / 2);
        return m >= 0 ? `+${m}` : `${m}`;
      }

      const facts = isParty
        ? [
            { k: 'Race',       v: fs.race || '—' },
            { k: 'Class',      v: [fs.charClass, fs.subclass].filter(Boolean).join(' — ') || '—' },
            { k: 'Alignment',  v: fs.alignment || '—' },
            { k: 'Background', v: fs.background || '—' },
          ]
        : fs.facts || [
            { k: 'Group',  v: fs.group || '—' },
            { k: 'Status', v: fs.dot === 'good' ? 'Friendly' : fs.dot === 'bad' ? 'Hostile' : 'Neutral' },
          ];

      const statblock = isParty && fs.str
        ? {
            ac: `${fs.ac || '—'}`,
            hp: `${fs.hpCurrent || '—'} / ${fs.hpMax || '—'}`,
            speed: `${fs.speed || 30} ft.`,
            abilities: [
              { stat: 'STR', val: `${fs.str}`, mod: abMod(fs.str) },
              { stat: 'DEX', val: `${fs.dex}`, mod: abMod(fs.dex) },
              { stat: 'CON', val: `${fs.con}`, mod: abMod(fs.con) },
              { stat: 'INT', val: `${fs.int}`, mod: abMod(fs.int) },
              { stat: 'WIS', val: `${fs.wis}`, mod: abMod(fs.wis) },
              { stat: 'CHA', val: `${fs.cha}`, mod: abMod(fs.cha) },
            ],
            traits: [],
          }
        : (isParty ? null : (fs.statblock || null));

      const appearance = Array.isArray(fs.appearance)
        ? fs.appearance
        : fs.backstory
          ? [fs.backstory]
          : fs.appearance
            ? [fs.appearance]
            : ['Details to be recorded.'];

      return {
        id: fs.id,
        name: fs.name,
        sub: fs.sub || '',
        region: fs.region || 'Barovia',
        visibility: fs.visibility || 'players',
        portrait: fs.portrait || fs.name,
        statuses: fs.statuses || [],
        facts,
        appearance,
        personality: fs.personality || '',
        secret: fs.secret || '',
        tactics: fs.tactics || '',
        statblock,
        rels: (fs.rels || []).map(r => ({
          id: r.id || null,
          name: r.name || r.n || '',
          type: r.type || r.t || '',
          kind: r.kind || 'character',
        })),
        notes: fs.notes || [],
        firestore: true,
        rosterRole: fs.rosterRole || '',
        group: fs.group || 'Allies',
        dot: fs.dot || 'neutral',
        imageUrl: fs.imageUrl || '',
      };
    }
    return null;
  }, [firestoreChars]);

  async function addCharacter(data) {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'characters');
    const maxOrder = firestoreChars.reduce((m, c) => Math.max(m, c.sortOrder || 0), 0);
    return addDoc(col, { ...data, sortOrder: maxOrder + 1, createdAt: serverTimestamp() });
  }

  async function updateCharacter(id, data) {
    return updateDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'characters', id), data);
  }

  async function deleteCharacter(id) {
    return deleteDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'characters', id));
  }

  async function seedCharacters() {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'characters');
    const batch = writeBatch(db);
    for (const { id, ...data } of CHARACTER_SEED) {
      batch.set(doc(col, id), data);
    }
    return batch.commit();
  }

  return {
    mergedRoster, getChar, loading, seeded: firestoreChars.length > 0,
    error, addCharacter, updateCharacter, deleteCharacter, seedCharacters,
  };
}
