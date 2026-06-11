export const ICONS = {
  pin:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  inn:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6"/></svg>',
  church: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v6M9 5h6M5 21V11l7-4 7 4v10"/><path d="M10 21v-4h4v4"/></svg>',
  castle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 21V8l3 2V6l3 2V5l4 0v3l3-2v4l3-2v13z"/><path d="M10 21v-5h4v5"/></svg>',
  door:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 21V4h14v17"/><path d="M9 4v17M15 12h.01"/></svg>',
  quest:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 3v18l4-3 4 3V3z"/><path d="M13 3h6v15"/></svg>',
};

export const TREE = [
  { id: 'barovia', name: 'Barovia', type: 'pin', children: [
    { id: 'vallaki', name: 'Vallaki', type: 'pin', children: [
      { id: 'blue-water-inn', name: 'Blue Water Inn', type: 'inn' },
      { id: 'st-andrals', name: "St. Andral's Church", type: 'church' },
      { id: 'town-square', name: 'Town Square', type: 'pin' },
    ]},
    { id: 'village-barovia', name: 'Village of Barovia', type: 'pin', children: [
      { id: 'bildraths', name: "Bildrath's Mercantile", type: 'door' },
    ]},
    { id: 'krezk', name: 'Krezk', type: 'pin' },
    { id: 'old-bonegrinder', name: 'Old Bonegrinder', type: 'door' },
    { id: 'ravenloft', name: 'Castle Ravenloft', type: 'castle', dm: true },
    { id: 'amber-temple', name: 'Amber Temple', type: 'castle', dm: true },
  ]},
];

const makeName = id => id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const stub = id => ({
  name: makeName(id), region: 'Barovia', parent: 'Barovia', parentId: 'barovia',
  type: 'Location', tags: [], visibility: 'players', img: 'Location',
  desc: ['Details to be recorded by the keeper of this tome.'],
  secret: 'No DM notes yet.', people: [], subs: [], quests: [], notes: [],
});

const BASE = {
  'blue-water-inn': {
    name: 'Blue Water Inn', region: 'Vallaki', parent: 'Vallaki', parentId: 'vallaki',
    type: 'Tavern & Lodging', tags: ['Safe haven', 'Wereraven nest'], visibility: 'players',
    img: 'Tavern interior · firelit common room',
    desc: [
      "The finest establishment in Vallaki, the Blue Water Inn is warm where the rest of the town is cold with fear. Lamplight pools on polished oak, the smell of paprikash drifts from the kitchen, and a bard’s tune almost makes one forget the mists pressing at the shutters.",
      "Run by the Martikov family, the inn is a rare pocket of genuine welcome — and, to those who know how to look, a nest of the Keepers of the Feather.",
    ],
    secret: "The Martikovs are wereravens and leaders of the Keepers of the Feather. Urwin will only reveal this if the party proves loyal — or if his son Brom is recovered. The wine cellar hides a passage the Keepers use to move unseen through Vallaki.",
    people: [
      { n: 'Urwin Martikov', r: 'Innkeeper · Wereraven', dm: false },
      { n: 'Danika Martikov', r: 'His wife · Wereraven', dm: false },
      { n: 'Ireena Kolyana', r: 'Guest · under guard', dm: false },
      { n: 'Rictavio', r: 'Travelling showman', dm: false },
      { n: 'Brom & Bray', r: 'Missing sons', dm: true },
    ],
    subs: [
      { id: 'inn-cellar', n: 'The Wine Cellar', d: 'Keeper passage', ic: 'door', dm: true },
      { id: 'inn-rooms', n: 'Guest Rooms', d: 'Ireena lodges here', ic: 'door' },
    ],
    quests: [{ n: 'Wizard of Wines', m: 'Recover the stolen gem · giver: Urwin' }],
    notes: [
      { scope: 'pub', who: 'Greg', when: '2d', body: 'Urwin clammed up the second I mentioned ravens. He knows something.' },
      { scope: 'priv', who: 'You', when: '4d', body: "Rictavio’s wagon has claw marks on the inside. Keep an eye on him." },
      { scope: 'dm', who: 'DM', when: '1w', body: 'If the party sleeps here, run the wereraven dream-warning hook.' },
    ],
  },
  'st-andrals': {
    name: "St. Andral's Church", region: 'Vallaki', parent: 'Vallaki', parentId: 'vallaki',
    type: 'Church', tags: ['Hallowed ground'], visibility: 'players',
    img: 'Candlelit nave · cracked stone',
    desc: ["A modest church on the north end of Vallaki, tended by Father Lucian Petrovich. Its consecrated ground is one of the few places in Barovia where the dead stay dead — so long as the bones beneath the altar remain."],
    secret: "The bones of St. Andral have been stolen by Henrik van der Voort at Strahd’s urging. Until they are returned, the church’s protection fails — and Strahd’s vampire spawn can enter on the night of the festival.",
    people: [
      { n: 'Father Lucian', r: 'Priest', dm: false },
      { n: 'Yeska', r: 'Orphan ward', dm: false },
    ],
    subs: [{ id: 'andral-undercroft', n: 'The Undercroft', d: 'Reliquary of bones', ic: 'door', dm: true }],
    quests: [{ n: 'The Stolen Bones', m: "Recover St. Andral’s relics · 3 days" }],
    notes: [{ scope: 'pub', who: 'Marian', when: '1d', body: 'Father Lucian seemed terrified when we asked about the crypt.' }],
  },
  'vallaki': {
    name: 'Vallaki', region: 'Barovia', parent: 'Barovia', parentId: 'barovia',
    type: 'Walled Town', tags: ["Burgomaster’s rule", 'Festivals'], visibility: 'players',
    img: 'Walled town under grey skies',
    desc: ["A walled town ruled by the iron paranoia of Burgomaster Vargas Vallakovich, who insists “all will be well” and mandates a relentless calendar of festivals to keep the gloom — and the truth — at bay. Behind the bunting, the town simmers."],
    secret: "Vargas’s festivals are a thin lid on a boiling pot. The Wachter family plots a coup, the church’s protection is failing, and Strahd watches it all with amusement.",
    people: [
      { n: 'Vargas Vallakovich', r: 'Burgomaster', dm: false },
      { n: 'Izek Strazni', r: 'Enforcer', dm: false },
      { n: 'Lady Wachter', r: 'Schemer', dm: true },
    ],
    subs: [
      { id: 'blue-water-inn', n: 'Blue Water Inn', d: 'Tavern & lodging', ic: 'inn' },
      { id: 'st-andrals', n: "St. Andral's Church", d: 'Hallowed ground', ic: 'church' },
      { id: 'town-square', n: 'Town Square', d: 'Stocks & festivals', ic: 'pin' },
    ],
    quests: [
      { n: 'Wizard of Wines', m: 'giver: Urwin' },
      { n: 'The Stolen Bones', m: '3 days' },
    ],
    notes: [{ scope: 'priv', who: 'You', when: '6d', body: 'Two factions here hate the Burgomaster. Possible leverage.' }],
  },
  'ravenloft': {
    name: 'Castle Ravenloft', region: 'Barovia', parent: 'Barovia', parentId: 'barovia',
    type: 'Seat of the Devil', tags: ["Strahd’s domain"], visibility: 'hidden',
    img: 'Spires above the mist',
    desc: ['The ancestral seat of the Von Zarovich line, looming on its precipice above the village. Few who climb the road to its gates ever return.'],
    secret: 'Use this as the campaign finale location. Heart of Sorrow mechanic active. Place the Tome, Sunsword, and Holy Symbol per the card reading before the party arrives.',
    people: [
      { n: 'Strahd von Zarovich', r: 'The Devil', dm: false },
      { n: 'Rahadin', r: 'Chamberlain', dm: true },
    ],
    subs: [{ id: 'rl-heart', n: 'Heart of Sorrow', d: 'Crystal sentinel', ic: 'door', dm: true }],
    quests: [],
    notes: [{ scope: 'dm', who: 'DM', when: '—', body: 'Not yet revealed to players. Reveal after the Tarokka reading.' }],
  },
};

export function getLoc(id) {
  return BASE[id] || stub(id);
}
