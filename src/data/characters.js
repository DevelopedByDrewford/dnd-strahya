export const STATUS_ICONS = {
  vampire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4l7 6 7-6-2 9a5 5 0 01-10 0z"/><path d="M9 13l1 3M15 13l-1 3"/></svg>',
  curse:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><path d="M8 8l8 8M16 8l-8 8"/></svg>',
  crown:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 18h16l-1-9-4 4-3-6-3 6-4-4z"/></svg>',
  heart:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20S4 14 4 8.5A3.5 3.5 0 0112 6a3.5 3.5 0 018 2.5C20 14 12 20 12 20z"/></svg>',
  shield:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></svg>',
  alert:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>',
};

export const ROSTER = [
  { grp: 'The Party', items: [
    { id: 'tessa',  n: 'Tessa Brightwood',     r: 'Cleric · Lv 5',             dot: 'good' },
    { id: 'marian', n: 'Marian Vox',            r: 'Rogue · Lv 5',              dot: 'good' },
    { id: 'aldric', n: 'Aldric Stormwell',      r: 'Fighter · Lv 5',            dot: 'good' },
  ]},
  { grp: 'Allies', items: [
    { id: 'ireena', n: 'Ireena Kolyana',         r: "Strahd's obsession",        dot: 'good' },
    { id: 'ismark', n: 'Ismark Kolyanovich',     r: "Burgomaster's son",         dot: 'good' },
    { id: 'urwin',  n: 'Urwin Martikov',         r: 'Innkeeper',                 dot: 'good' },
  ]},
  { grp: 'Enemies', items: [
    { id: 'strahd',  n: 'Strahd von Zarovich',  r: 'The Devil of Barovia',      dot: 'bad'  },
    { id: 'rahadin', n: 'Rahadin',               r: 'Chamberlain',               dot: 'bad'  },
  ]},
  { grp: 'Hidden', dm: true, items: [
    { id: 'vasili', n: 'Vasili von Holtz', r: "?? Strahd's alias", dot: 'bad', dm: true },
  ]},
];

const BASE = {
  strahd: {
    name: 'Strahd von Zarovich', sub: 'The Devil of Barovia, Lord of Ravenloft',
    region: 'Castle Ravenloft', visibility: 'players',
    portrait: 'Pale aristocrat · crimson cloak',
    statuses: [
      { t: 'Vampire', i: 'vampire', c: 'bad' },
      { t: 'Cursed',  i: 'curse',   c: 'bad' },
      { t: 'Hostile', i: 'alert',   c: 'bad' },
    ],
    facts: [
      { k: 'Type',    v: 'Undead'        },
      { k: 'Faction', v: 'Dark Powers',  link: true },
      { k: 'Seat',    v: 'Ravenloft',    link: true },
      { k: 'Status',  v: 'Active'        },
    ],
    appearance: [
      'A tall, handsome man of regal bearing, his skin pale as the moon and his eyes black and bottomless. He dresses in the fashion of a bygone age — a crimson-lined cloak, a signet of the Von Zarovich line upon his finger.',
      'He is unfailingly courteous, a gracious host even to those he intends to destroy. His voice is soft. His patience is centuries deep.',
    ],
    personality: 'Possessive, proud, and profoundly lonely. He mistakes obsession for love and sees the party as pieces in a game he has played a thousand times.',
    secret: "Strahd cannot leave Barovia — the mists are his prison as much as his domain. He seeks in Ireena the reincarnation of Tatyana, the bride whose death he caused. He will court the party as guests, test them, and turn cruel the instant they threaten his designs on her. The Tarokka reading determines his weaknesses' locations.",
    tactics: "Opens with charm and hospitality. Uses the castle's Heart of Sorrow to negate damage. Fights only on his terms — retreats into mist at 1/3 HP to strike again at dawn's opposite.",
    statblock: {
      cr: '15', ac: '16 (natural armor)', hp: '144 (17d8+68)', speed: '30 ft.',
      abilities: [
        ['STR', '18', '+4'], ['DEX', '18', '+4'], ['CON', '18', '+4'],
        ['INT', '20', '+5'], ['WIS', '15', '+2'], ['CHA', '18', '+4'],
      ],
      traits: [
        { n: 'Regeneration', d: "Regains 20 HP at the start of his turn if he has at least 1 HP and isn't in sunlight or running water." },
        { n: 'Vampire Weaknesses', d: 'Forbiddance, harmed by running water, stake to the heart, sunlight hypersensitivity.' },
        { n: 'Spider Climb', d: 'Can climb difficult surfaces, including upside down, without an ability check.' },
      ],
    },
    rels: [
      { n: 'Ireena Kolyana',    t: 'Obsession',       id: 'ireena'  },
      { n: 'Rahadin',           t: 'Loyal servant',   id: 'rahadin' },
      { n: 'Castle Ravenloft',  t: 'Domain',          id: 'ravenloft' },
      { n: 'Rahadin',           t: 'Chamberlain',     id: 'rahadin', dm: true },
    ],
    notes: [
      { scope: 'pub',  who: 'Greg', when: '2d', body: "He let us walk out of the castle alive. That wasn't mercy — it was a message." },
      { scope: 'priv', who: 'You',  when: '4d', body: 'Sunlight + running water. If we can corner him near the falls at dawn…' },
      { scope: 'dm',   who: 'DM',   when: '1w', body: "Card reading placed the Sunsword in the Amber Temple. Don't let them rush Ravenloft before they have it." },
    ],
  },

  ireena: {
    name: 'Ireena Kolyana', sub: 'Adopted daughter of the late Burgomaster',
    region: 'Village of Barovia', visibility: 'players',
    portrait: 'Auburn hair · iron will',
    statuses: [
      { t: 'Hunted',  i: 'alert',  c: 'bad'  },
      { t: 'Resolute', i: 'shield', c: 'good' },
    ],
    facts: [
      { k: 'Type',     v: 'Human'   },
      { k: 'Faction',  v: '—'       },
      { k: 'Location', v: 'Vallaki', link: true },
      { k: 'Status',   v: 'Alive'   },
    ],
    appearance: ['A striking young woman with auburn hair and a fierce, steady gaze. Grief over her father has hardened into resolve. She refuses to be anyone\'s prize — least of all Strahd\'s.'],
    personality: 'Brave to the point of stubbornness. Protective of the party that protects her, but chafes at being treated as cargo to be escorted.',
    secret: "Ireena is the latest reincarnation of Tatyana, Strahd's lost love. The two puncture wounds on her neck mark his growing hold. Sergei's spirit at the Krezk pool may finally free her soul — the campaign's most bittersweet 'good' ending.",
    tactics: '',
    statblock: null,
    rels: [
      { n: 'Ismark Kolyanovich',   t: 'Brother',     id: 'ismark' },
      { n: 'Strahd von Zarovich',  t: 'Pursued by',  id: 'strahd' },
    ],
    notes: [
      { scope: 'pub', who: 'Marian', when: '1d', body: 'She insisted on keeping her own blade. Good. She\'ll need it.' },
      { scope: 'dm',  who: 'DM',     when: '3d', body: 'If she reaches the Krezk pool and meets Sergei, run the release scene.' },
    ],
  },

  tessa: {
    name: 'Tessa Brightwood', sub: 'Cleric of the Morninglord · Level 5',
    region: 'Travelling with the party', visibility: 'players',
    portrait: 'Half-elf · holy symbol aloft',
    statuses: [
      { t: 'Blessed',          i: 'heart',  c: 'good' },
      { t: 'Player Character', i: 'shield', c: 'good' },
    ],
    facts: [
      { k: 'Race',   v: 'Half-elf' },
      { k: 'Class',  v: 'Cleric'   },
      { k: 'Level',  v: '5'        },
      { k: 'Player', v: 'You'      },
    ],
    appearance: ['Warm-eyed and travel-worn, Tessa carries the light of the Morninglord into the darkest corners of Barovia — sometimes literally, her holy symbol blazing against the gloom.'],
    personality: 'Compassionate but no fool. She has learned that mercy in Barovia must be armed.',
    secret: "(Players own their own character's private fields. The DM sees nothing here unless the player shares it.)",
    tactics: '',
    statblock: null,
    rels: [
      { n: 'The Party',       t: 'Faction',          id: 'aldric' },
      { n: 'Ireena Kolyana',  t: 'Sworn to protect', id: 'ireena' },
    ],
    notes: [
      { scope: 'priv', who: 'You', when: '5d', body: 'Down to two spell slots. Need a long rest before Krezk.' },
    ],
  },
};

const STUB_META = {
  marian:  ['Marian Vox',          'Rogue of the party',     'players'],
  aldric:  ['Aldric Stormwell',    'Fighter of the party',   'players'],
  ismark:  ['Ismark Kolyanovich',  'Brother to Ireena',      'players'],
  urwin:   ['Urwin Martikov',      'Innkeeper & wereraven',  'players'],
  rahadin: ['Rahadin',             'Chamberlain of Ravenloft','players'],
  vasili:  ['Vasili von Holtz',    'Strahd in disguise',     'hidden'],
};

function makeStub(id) {
  const m = STUB_META[id] || [id, 'Unknown', 'players'];
  return {
    name: m[0], sub: m[1], region: 'Barovia', visibility: m[2],
    portrait: m[0], statuses: [],
    facts: [{ k: 'Type', v: '—' }, { k: 'Faction', v: '—' }, { k: 'Location', v: 'Barovia' }, { k: 'Status', v: '—' }],
    appearance: ['Details to be recorded by the keeper of this tome.'],
    personality: '', secret: 'No DM notes yet.', tactics: '',
    statblock: null, rels: [], notes: [],
  };
}

export function getChar(id) {
  return BASE[id] || makeStub(id);
}
