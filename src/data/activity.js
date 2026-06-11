// Record-type icons (inline SVG strings)
export const REC_I = {
  char:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  loc:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  quest:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3v18l4-3 4 3V3z"/><path d="M13 3h6v15"/></svg>',
  loot:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9h16v10H4z"/><path d="M4 9l2-4h12l2 4"/></svg>',
  note:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h11l3 3v13H5z"/><path d="M9 9h6M9 13h6"/></svg>',
  timeline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v18M4 7h4M16 7h4"/></svg>',
};

// Action verb icons
export const ACT_I = {
  create:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
  edit:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
  note:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h11l3 3v13H5z"/><path d="M9 12h6"/></svg>',
  claim:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 13l4 4L19 7"/></svg>',
  complete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
  reveal:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  join:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 3-5 6-5s6 1.5 6 5M17 9v6M14 12h6"/></svg>',
};

// Map record types to React Router routes
export const REC_ROUTES = {
  char:     '/characters',
  loc:      '/locations',
  quest:    '/quests',
  loot:     '/loot',
  note:     '/my-character',
  timeline: '/timeline',
};

// Live presence (who's in the session right now)
export const PRESENCE = [
  { n: 'Tessa', you: true,  color: 'var(--gold-2)' },
  { n: 'Greg',              color: 'var(--player)'  },
  { n: 'Marian',            color: 'var(--live)'    },
];

// Activity feed — newest first
// Fields:
//   id, who, act, cat, scope?, rec?, recType?, recSecond?, text, extra?, day, when, dm?
export const ACTIVITY = [
  { id: 'a1',  who: 'Greg',     act: 'note',     cat: 'note',    scope: 'pub',
    rec: 'Strahd von Zarovich', recType: 'char',
    text: 'added a public note to',       day: 'Today',     when: '2 min ago' },

  { id: 'a2',  who: 'You',      act: 'edit',     cat: 'quest',
    rec: 'Free the Soul Coins', recType: 'quest',
    text: 'updated the quest',            day: 'Today',     when: '1 hour ago' },

  { id: 'a3',  who: 'You (DM)', act: 'reveal',   cat: 'reveal',  dm: true,
    rec: 'Castle Ravenloft',    recType: 'loc',
    text: 'revealed the location', extra: 'Party notified',
    day: 'Today',     when: '1 hour ago' },

  { id: 'a4',  who: 'Marian',   act: 'claim',    cat: 'loot',
    rec: 'Potion of Healing ×2', recType: 'loot',
    text: 'claimed',                      day: 'Today',     when: '3 hours ago' },

  { id: 'a5',  who: 'Tessa',    act: 'join',     cat: 'session',
    text: 'joined the session',           day: 'Today',     when: '3 hours ago' },

  { id: 'a6',  who: 'Greg',     act: 'complete', cat: 'quest',
    rec: 'Recover the first coin', recType: 'quest',
    recSecond: 'Free the Soul Coins',
    text: 'completed an objective in',   day: 'Yesterday', when: 'Day 6' },

  { id: 'a7',  who: 'You',      act: 'note',     cat: 'note',    scope: 'priv',
    rec: 'Blue Water Inn', recType: 'loc',
    text: 'wrote a private note on',     day: 'Yesterday', when: 'Day 6' },

  { id: 'a8',  who: 'You (DM)', act: 'note',     cat: 'note',    scope: 'dm',  dm: true,
    rec: 'Free the Soul Coins', recType: 'quest',
    text: 'left a DM-only note on',     day: 'Yesterday', when: 'Day 6' },

  { id: 'a9',  who: 'Aldric',   act: 'edit',     cat: 'char',
    rec: 'Ireena Kolyana', recType: 'char',
    text: 'edited the appearance of',   day: 'Yesterday', when: 'Day 5' },

  { id: 'a10', who: 'You (DM)', act: 'create',   cat: 'char',    dm: true,
    rec: 'Vasili von Holtz', recType: 'char',
    text: 'created a hidden character', day: 'This week', when: 'Day 4' },

  { id: 'a11', who: 'Marian',   act: 'edit',     cat: 'timeline',
    rec: 'The Bones Are Gone', recType: 'timeline',
    text: 'logged a timeline entry',    day: 'This week', when: 'Day 4' },

  { id: 'a12', who: 'Greg',     act: 'create',   cat: 'quest',
    rec: 'Wizard of Wines', recType: 'quest',
    text: 'created the quest',          day: 'This week', when: 'Day 3' },
];
