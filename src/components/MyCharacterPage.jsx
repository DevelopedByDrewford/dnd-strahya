import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MyCharacterPage.css';

const MENU_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
const EDIT_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13 5l4 4"/></svg>';
const STAR_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l2 5h5l-4 4 1.5 6L12 20 7.5 22 9 16 5 12h5z"/></svg>';
const USER_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
const PLUS_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';

const ABILITIES = [
  { ab: 'STR', mod: '+0', sc: '10' },
  { ab: 'DEX', mod: '+2', sc: '14' },
  { ab: 'CON', mod: '+1', sc: '13' },
  { ab: 'INT', mod: '+1', sc: '12' },
  { ab: 'WIS', mod: '+4', sc: '17' },
  { ab: 'CHA', mod: '+1', sc: '13' },
];

const VITALS = [
  { k: 'Armor Class',  v: '18',      cls: 'ac' },
  { k: 'Hit Points',   v: '31 / 38', cls: 'hp', hp: 82 },
  { k: 'Initiative',   v: '+2'       },
  { k: 'Speed',        v: '30'       },
  { k: 'Prof. Bonus',  v: '+3'       },
];

const CONDITIONS = [
  { label: 'Bless (1 min)', state: 'good', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20S4 14 4 8.5A3.5 3.5 0 0112 6a3.5 3.5 0 018 2.5C20 14 12 20 12 20z"/></svg>' },
  { label: 'Exhaustion 1',  state: 'bad',  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>' },
  { label: "Heroes' Feast", state: '',     icon: '' },
];

const INVENTORY = [
  { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 4l6 6-7 7-2-2 7-7M3 21l5-5"/></svg>', name: 'Mace', sub: '1d6 bludgeoning', qty: '—' },
  { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></svg>', name: 'Shield of the Dawn', sub: '+2 AC · sheds dim light', qty: '—', attuned: true },
  { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/></svg>', name: 'Holy Symbol of the Morninglord', sub: 'Spellcasting focus', qty: '—' },
  { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 3h4v4l4 9a4 4 0 01-3.6 5.6H9.6A4 4 0 016 16l4-9z"/><path d="M8 13h8"/></svg>', name: 'Potion of Healing', sub: '2d4 + 2 HP', qty: '×3' },
];

const BONDS = [
  { initial: 'I', name: 'Ireena Kolyana', type: 'Sworn to protect', to: '/characters' },
  { initial: 'M', name: 'Marian Vox',     type: 'Party · trusted',  to: '/characters' },
  { initial: 'B', name: 'Blue Water Inn', type: 'Current refuge',   to: '/locations'  },
];

const JOURNAL = [
  { scope: 'priv', tag: '🔒 Private',     tagClass: 'priv', day: 'Day 7', body: "Down to two healing potions and one good night's sleep in a week. Something has to give before Krezk." },
  { scope: 'pub',  tag: 'Public · party', tagClass: 'pub2', day: 'Day 4', body: 'If anyone finds running water near the castle — tell me. It matters.' },
];

// Initial spell slot state: true = open, false = used
const SLOT_INITIAL = {
  '1st': [false, false, true, true],
  '2nd': [false, true, true],
  '3rd': [true, true],
  'cd':  [true],
};

export default function MyCharacterPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [editing, setEditing] = useState(false);
  const [slots, setSlots]     = useState(SLOT_INITIAL);

  useEffect(() => {
    document.body.classList.toggle('editing', editing);
    return () => document.body.classList.remove('editing');
  }, [editing]);

  function togglePip(level, idx) {
    setSlots(prev => ({
      ...prev,
      [level]: prev[level].map((v, i) => i === idx ? !v : v),
    }));
  }

  function closeAll() {
    onCloseNav();
  }

  const slotRows = [
    { label: '1st level', key: '1st' },
    { label: '2nd level', key: '2nd' },
    { label: '3rd level', key: '3rd' },
    { label: 'Channel Divinity', key: 'cd', divider: true },
  ];

  return (
    <div className="mc-app">
      <div className="scrim" onClick={closeAll} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

      <div className="mc-main">
        <div className="mc-topbar">
          <div className="mc-crumb">
            <button className="hamburger btn sm icon" onClick={onToggleNav}
              dangerouslySetInnerHTML={{ __html: MENU_SVG }} />
            <span>You › <b>My Character</b></span>
          </div>
          <button className={`editbtn${editing ? ' on' : ''}`} onClick={() => setEditing(e => !e)}>
            <span dangerouslySetInnerHTML={{ __html: EDIT_SVG }} />
            {editing ? 'Done editing' : 'Edit sheet'}
          </button>
        </div>

        <div className="mc-wrap">
          {/* Identity hero */}
          <div className="mc-hero">
            <div className="mc-portrait">
              <div className="pfr">
                <span dangerouslySetInnerHTML={{ __html: USER_SVG }} />
                Portrait
                {editing && <span style={{ color: 'var(--gold-2)' }}>↑ Upload</span>}
              </div>
            </div>
            <div className="mc-identity">
              <div className="eyebrow">Player Character · Tessa</div>
              <h1>Tessa Brightwood</h1>
              <div className="cls">Half-elf · Cleric of the Morninglord · Level 5</div>
              <div className="badges">
                <span className="owntag">
                  <span dangerouslySetInnerHTML={{ __html: STAR_SVG }} />
                  Your character
                </span>
                <span className="chip">Life Domain</span>
                <span className="chip">Lawful Good</span>
                <span className="chip">Acolyte</span>
              </div>
            </div>
          </div>

          {/* Vitals strip */}
          <div className="vitals">
            {VITALS.map(v => (
              <div key={v.k} className={`vital${v.cls ? ' ' + v.cls : ''}`}>
                <div className="k">{v.k}</div>
                <div className="v">{v.v}</div>
                {v.hp != null && (
                  <div className="hpbar"><span style={{ width: `${v.hp}%` }} /></div>
                )}
              </div>
            ))}
          </div>

          <div className="mc-body">
            {/* Left column */}
            <div className="mc-colL">
              {/* Ability Scores */}
              <div className="mc-sec">
                <div className="sh"><h3>Ability Scores</h3></div>
                <div className="abilities">
                  {ABILITIES.map(a => (
                    <div key={a.ab} className="ability">
                      <div className="ab">{a.ab}</div>
                      <div className="mod">{a.mod}</div>
                      <div className="sc">{a.sc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="mc-sec">
                <div className="sh">
                  <h3>Conditions &amp; Effects</h3>
                  <button className="btn sm" dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Track' }} />
                </div>
                <div className="conds">
                  {CONDITIONS.map((c, i) => (
                    <span key={i} className={`cond${c.state ? ' ' + c.state : ''}`}>
                      {c.icon && <span dangerouslySetInnerHTML={{ __html: c.icon }} />}
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Backstory */}
              <div className="mc-sec">
                <div className="sh"><h3>Backstory</h3></div>
                <div className="mc-prose">Raised in the abbey of Elturel, Tessa carried the light of the Morninglord into a land that has forgotten the sun. She came to Barovia chasing a missing pilgrim caravan — and found the mists closing behind her. Where her faith once brought comfort, here it is a weapon she has learned to wield without flinching.</div>
              </div>

              {/* Inventory */}
              <div className="mc-sec">
                <div className="sh">
                  <h3>Inventory</h3>
                  <button className="btn sm" dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Add item' }} />
                </div>
                <div className="inv">
                  {INVENTORY.map((item, i) => (
                    <div key={i} className="irow">
                      <span className="ithumb" dangerouslySetInnerHTML={{ __html: item.icon }} />
                      <div>
                        <div className="inm">{item.name}</div>
                        <div className="isub">{item.sub}</div>
                      </div>
                      <span className="iqty">{item.qty}</span>
                      {item.attuned ? <span className="iattune">attuned</span> : <span />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <aside className="mc-aside">
              {/* Spell Slots */}
              <div className="scard">
                <div className="sk">Spell Slots</div>
                {slotRows.map(row => (
                  <div key={row.key} className={`slot${row.divider ? ' divider' : ''}`}>
                    <span className="sdesc">{row.label}</span>
                    <span className="pips">
                      {slots[row.key].map((open, idx) => (
                        <span
                          key={idx}
                          className={`pip ${open ? 'open' : 'used'}`}
                          onClick={() => togglePip(row.key, idx)}
                          title={open ? 'Mark used' : 'Restore'}
                        />
                      ))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bonds & Allies */}
              <div className="scard">
                <div className="sk">Bonds &amp; Allies</div>
                {BONDS.map((b, i) => (
                  <Link key={i} className="mc-linkrow" to={b.to}>
                    <span className="av" style={{ width: 30, height: 30, fontSize: 12 }}>{b.initial}</span>
                    <div>
                      <div className="nm">{b.name}</div>
                      <div className="ty">{b.type}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* My Journal */}
              <div className="scard">
                <div className="sk">
                  <span>My Journal</span>
                  <Link to="/my-notes" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: 11, letterSpacing: 0, textTransform: 'none' }}>
                    View all →
                  </Link>
                </div>
                {JOURNAL.map((j, i) => (
                  <div key={i} className="jnote">
                    <div className="jh">
                      <span className={`chip sm ${j.tagClass}`}>{j.tag}</span>
                      <span className="tiny dim">{j.day}</span>
                    </div>
                    <div className="jb">{j.body}</div>
                  </div>
                ))}
                <button className="btn blood" style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}
                  dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' New journal entry' }} />
              </div>
            </aside>
          </div>
        </div>
      </div>

    </div>
  );
}
