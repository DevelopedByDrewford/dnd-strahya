import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { TREE as STATIC_TREE, getLoc as staticGetLoc } from '../data/locations';

const LOCATION_SEED = [
  { id: 'barovia',          parentId: null,             sortOrder: 0,  iconType: 'pin',    locationType: 'Cursed Land',      visibility: 'players', tags: ['Mist-locked', 'Domain of Strahd'],
    name: 'Barovia',
    desc: ["The land of Barovia is a valley sealed by the Mists, its skies eternally overcast, its people ground down by centuries of Strahd's rule. Every road leads eventually to Castle Ravenloft. There is no escape — only endurance, and the slim hope of a chosen few who arrived from beyond."],
    secret: "Barovia is Strahd's Domain of Dread — a demiplane prison for him as much as the people. The mists will not let anyone leave until Strahd is destroyed or released.",
    people: [], subs: [], quests: [], notes: [] },

  { id: 'vallaki',          parentId: 'barovia',        sortOrder: 1,  iconType: 'pin',    locationType: 'Walled Town',      visibility: 'players', tags: ["Burgomaster's rule", 'Festivals'],
    name: 'Vallaki',
    desc: ["A walled town ruled by the iron paranoia of Burgomaster Vargas Vallakovich, who insists \"all will be well\" and mandates a relentless calendar of festivals to keep the gloom — and the truth — at bay. Behind the bunting, the town simmers."],
    secret: "Vargas's festivals are a thin lid on a boiling pot. The Wachter family plots a coup, the church's protection is failing, and Strahd watches it all with amusement.",
    people: [
      { n: 'Vargas Vallakovich', r: 'Burgomaster', dm: false },
      { n: 'Izek Strazni',       r: 'Enforcer',    dm: false },
      { n: 'Lady Wachter',       r: 'Schemer',      dm: true  },
    ],
    subs: [
      { id: 'blue-water-inn', n: 'Blue Water Inn',        d: 'Tavern & lodging',  ic: 'inn'    },
      { id: 'st-andrals',     n: "St. Andral's Church",   d: 'Hallowed ground',   ic: 'church' },
      { id: 'town-square',    n: 'Town Square',           d: 'Stocks & festivals',ic: 'pin'    },
    ],
    quests: [{ n: 'Wizard of Wines', m: 'giver: Urwin' }, { n: 'The Stolen Bones', m: '3 days' }],
    notes: [{ scope: 'priv', who: 'You', when: '6d', body: 'Two factions here hate the Burgomaster. Possible leverage.' }] },

  { id: 'blue-water-inn',   parentId: 'vallaki',        sortOrder: 2,  iconType: 'inn',    locationType: 'Tavern & Lodging', visibility: 'players', tags: ['Safe haven', 'Wereraven nest'],
    name: 'Blue Water Inn',
    desc: [
      "The finest establishment in Vallaki, the Blue Water Inn is warm where the rest of the town is cold with fear. Lamplight pools on polished oak, the smell of paprikash drifts from the kitchen, and a bard's tune almost makes one forget the mists pressing at the shutters.",
      "Run by the Martikov family, the inn is a rare pocket of genuine welcome — and, to those who know how to look, a nest of the Keepers of the Feather.",
    ],
    secret: "The Martikovs are wereravens and leaders of the Keepers of the Feather. Urwin will only reveal this if the party proves loyal — or if his son Brom is recovered. The wine cellar hides a passage the Keepers use to move unseen through Vallaki.",
    people: [
      { n: 'Urwin Martikov',  r: 'Innkeeper · Wereraven', dm: false },
      { n: 'Danika Martikov', r: 'His wife · Wereraven',  dm: false },
      { n: 'Ireena Kolyana',  r: 'Guest · under guard',   dm: false },
      { n: 'Rictavio',        r: 'Travelling showman',    dm: false },
      { n: 'Brom & Bray',     r: 'Missing sons',          dm: true  },
    ],
    subs: [
      { id: 'inn-cellar', n: 'The Wine Cellar', d: 'Keeper passage',      ic: 'door', dm: true },
      { id: 'inn-rooms',  n: 'Guest Rooms',     d: 'Ireena lodges here',  ic: 'door' },
    ],
    quests: [{ n: 'Wizard of Wines', m: 'Recover the stolen gem · giver: Urwin' }],
    notes: [
      { scope: 'pub',  who: 'Greg', when: '2d', body: 'Urwin clammed up the second I mentioned ravens. He knows something.' },
      { scope: 'priv', who: 'You',  when: '4d', body: "Rictavio's wagon has claw marks on the inside. Keep an eye on him." },
      { scope: 'dm',   who: 'DM',   when: '1w', body: 'If the party sleeps here, run the wereraven dream-warning hook.' },
    ] },

  { id: 'st-andrals',       parentId: 'vallaki',        sortOrder: 3,  iconType: 'church', locationType: 'Church',           visibility: 'players', tags: ['Hallowed ground'],
    name: "St. Andral's Church",
    desc: ["A modest church on the north end of Vallaki, tended by Father Lucian Petrovich. Its consecrated ground is one of the few places in Barovia where the dead stay dead — so long as the bones beneath the altar remain."],
    secret: "The bones of St. Andral have been stolen by Henrik van der Voort at Strahd's urging. Until they are returned, the church's protection fails — and Strahd's vampire spawn can enter on the night of the festival.",
    people: [
      { n: 'Father Lucian', r: 'Priest',       dm: false },
      { n: 'Yeska',         r: 'Orphan ward',  dm: false },
    ],
    subs: [{ id: 'andral-undercroft', n: 'The Undercroft', d: 'Reliquary of bones', ic: 'door', dm: true }],
    quests: [{ n: 'The Stolen Bones', m: "Recover St. Andral's relics · 3 days" }],
    notes: [{ scope: 'pub', who: 'Marian', when: '1d', body: 'Father Lucian seemed terrified when we asked about the crypt.' }] },

  { id: 'town-square',      parentId: 'vallaki',        sortOrder: 4,  iconType: 'pin',    locationType: 'Public Space',     visibility: 'players', tags: ['Festivals', 'Stocks'],
    name: 'Town Square',
    desc: ["The heart of Vallaki, where the Burgomaster's mandatory festivals are staged and where dissenters are placed in the stocks as a reminder that all will be well."],
    secret: "The stocks see frequent use. The party may find an unexpected ally — or a useful distraction — here during festival nights.",
    people: [], subs: [], quests: [], notes: [] },

  { id: 'village-barovia',  parentId: 'barovia',        sortOrder: 5,  iconType: 'pin',    locationType: 'Village',          visibility: 'players', tags: ['Starting location', 'Under siege'],
    name: 'Village of Barovia',
    desc: ["The gloomy village where the party first arrived in Barovia. Its people are hollow-eyed and half-mad with fear, its streets empty after dark, its buildings shuttered against the night."],
    secret: "Strahd's attention lingers here because of Ireena. Once the party leaves with her, he will follow.",
    people: [
      { n: 'Ismark Kolyanovich', r: "Burgomaster's son",   dm: false },
      { n: 'Mad Mary',           r: 'Grieving mother',     dm: false },
    ],
    subs: [{ id: 'bildraths', n: "Bildrath's Mercantile", d: 'Only shop in town', ic: 'door' }],
    quests: [], notes: [] },

  { id: 'bildraths',        parentId: 'village-barovia', sortOrder: 6, iconType: 'door',   locationType: 'Shop',             visibility: 'players', tags: ['Overpriced'],
    name: "Bildrath's Mercantile",
    desc: ["The only shop in the village of Barovia, run by the gouging Bildrath Cantemir. His prices are ten times the normal rate — he knows the party has no alternative."],
    secret: "Bildrath's nephew Parriwimple serves as muscle and is easily befriended.",
    people: [
      { n: 'Bildrath Cantemir', r: 'Proprietor',              dm: false },
      { n: 'Parriwimple',       r: 'Nephew · strong & simple', dm: false },
    ],
    subs: [], quests: [], notes: [] },

  { id: 'krezk',            parentId: 'barovia',        sortOrder: 7,  iconType: 'pin',    locationType: 'Walled Village',   visibility: 'players', tags: ['Fortified', 'Abbey nearby'],
    name: 'Krezk',
    desc: ["A walled village on the slopes of Mount Baratok, its gates guarded by suspicious villagers who will not open them without proof of an errand done for the Burgomaster. Beyond lies the Abbey of Saint Markovia — and its unsettling Abbot."],
    secret: "The Abbot is an angel who has lost his way, building a 'bride' for Strahd from corpse parts to end the curse. Krezk's pool is where Ireena can find her final rest.",
    people: [
      { n: 'Dmitri Krezkov', r: 'Lord of Krezk',             dm: false },
      { n: 'The Abbot',      r: 'Abbot of Saint Markovia',   dm: true  },
    ],
    subs: [], quests: [{ n: 'Escort Ireena', m: 'Destination · safety' }], notes: [] },

  { id: 'old-bonegrinder',  parentId: 'barovia',        sortOrder: 8,  iconType: 'door',   locationType: 'Windmill',         visibility: 'players', tags: ['Night hags', 'Dream pastries'],
    name: 'Old Bonegrinder',
    desc: ["A three-story windmill on a hill, home to the Bonegrinder hags who sell dream pastries that grant sweet dreams — at a terrible price."],
    secret: "The Bonegrinder hags are Morgantha, Bella Sunbane, and Offalia Wormwiggle. The pastries are made from ground children's bones. The first soul coin is here.",
    people: [{ n: 'Morgantha', r: 'Night hag · pastry seller', dm: true }],
    subs: [], quests: [{ n: 'Free the Soul Coins', m: 'First coin is here' }], notes: [] },

  { id: 'ravenloft',        parentId: 'barovia',        sortOrder: 9,  iconType: 'castle', locationType: 'Seat of the Devil', visibility: 'hidden', tags: ["Strahd's domain"],
    name: 'Castle Ravenloft',
    desc: ['The ancestral seat of the Von Zarovich line, looming on its precipice above the village. Few who climb the road to its gates ever return.'],
    secret: 'Use this as the campaign finale location. Heart of Sorrow mechanic active. Place the Tome, Sunsword, and Holy Symbol per the card reading before the party arrives.',
    people: [
      { n: 'Strahd von Zarovich', r: 'The Devil',    dm: false },
      { n: 'Rahadin',             r: 'Chamberlain',  dm: true  },
    ],
    subs: [{ id: 'rl-heart', n: 'Heart of Sorrow', d: 'Crystal sentinel', ic: 'door', dm: true }],
    quests: [], notes: [{ scope: 'dm', who: 'DM', when: '—', body: 'Not yet revealed to players. Reveal after the Tarokka reading.' }] },

  { id: 'amber-temple',     parentId: 'barovia',        sortOrder: 10, iconType: 'castle', locationType: 'Ancient Ruin',     visibility: 'hidden', tags: ['Dark gifts', 'Amber sarcophagi'],
    name: 'Amber Temple',
    desc: ['A ruined temple high in the Balinok Mountains, built by wizards who sought to contain vestiges of ancient evil. Now guarded by the lich Exethanter — or what remains of him.'],
    secret: "The Sunsword's hilt is here per the Tarokka reading. The amber sarcophagi offer dark gifts — let a player be genuinely tempted.",
    people: [{ n: 'Exethanter', r: 'Lich · guardian', dm: true }],
    subs: [], quests: [], notes: [] },
];

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

export function flattenTree(nodes, result = []) {
  nodes.forEach(n => {
    result.push({ id: n.id, name: n.name });
    if (n.children) flattenTree(n.children, result);
  });
  return result;
}

function findNodeName(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n.name;
    if (n.children) {
      const found = findNodeName(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

export const PARENT_OPTIONS = flattenTree(STATIC_TREE);

export function useLocations({ isDM = false } = {}) {
  const [firestoreLocs, setFirestoreLocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'locations');
    const q = isDM
      ? query(col, orderBy('sortOrder', 'asc'))
      : query(col, where('visibility', '==', 'players'), orderBy('sortOrder', 'asc'));
    const unsub = onSnapshot(q,
      snap => {
        setFirestoreLocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => {
        setLoading(false);
        setError(err);
      },
    );
    return unsub;
  }, [isDM]);

  const mergedTree = useCallback(() => {
    if (firestoreLocs.length === 0) return [];

    const nodeMap = {};
    for (const loc of firestoreLocs) {
      nodeMap[loc.id] = {
        id: loc.id,
        name: loc.name,
        type: loc.iconType || 'pin',
        ...(loc.visibility === 'hidden' ? { dm: true } : {}),
        children: [],
      };
    }
    const roots = [];
    for (const loc of firestoreLocs) {
      const node = nodeMap[loc.id];
      if (loc.parentId && nodeMap[loc.parentId]) {
        nodeMap[loc.parentId].children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }, [firestoreLocs])();

  const getLoc = useCallback((id) => {
    const fs = firestoreLocs.find(l => l.id === id);
    if (fs) {
      const parentName = findNodeName(STATIC_TREE, fs.parentId)
        || firestoreLocs.find(l => l.id === fs.parentId)?.name
        || fs.parentId || 'Barovia';
      return {
        id: fs.id,
        name: fs.name,
        region: parentName,
        parent: parentName,
        parentId: fs.parentId || '',
        type: fs.locationType || 'Location',
        tags: fs.tags || [],
        visibility: fs.visibility || 'players',
        img: fs.name,
        imageUrl: fs.imageUrl || '',
        desc: Array.isArray(fs.desc) ? fs.desc : (fs.desc ? [fs.desc] : ['No description yet.']),
        secret: fs.secret || '',
        people: fs.people || [],
        subs: fs.subs || [],
        quests: fs.quests || [],
        notes: fs.notes || [],
        firestore: true,
      };
    }
    const s = staticGetLoc(id);
    return s ? { ...s, id } : null;
  }, [firestoreLocs]);

  async function addLocation(data) {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'locations');
    const maxOrder = firestoreLocs.reduce((m, l) => Math.max(m, l.sortOrder || 0), 0);
    return addDoc(col, { ...data, sortOrder: maxOrder + 1, createdAt: serverTimestamp() });
  }

  async function updateLocation(id, data) {
    return updateDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'locations', id), data);
  }

  async function deleteLocation(id) {
    return deleteDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'locations', id));
  }

  async function seedLocations() {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'locations');
    const batch = writeBatch(db);
    for (const { id, ...data } of LOCATION_SEED) {
      batch.set(doc(col, id), data);
    }
    return batch.commit();
  }

  return { mergedTree, getLoc, locations: firestoreLocs, loading, seeded: firestoreLocs.length > 0, error, addLocation, updateLocation, deleteLocation, seedLocations };
}
