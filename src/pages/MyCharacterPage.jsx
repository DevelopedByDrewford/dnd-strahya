import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import MyCharacterModal from '../components/MyCharacterModal';
import SignInRequired from '../components/SignInRequired';
import { useMyCharacter } from '../hooks/useMyCharacter';
import ImageLightbox from '../components/ImageLightbox';
import './MyCharacterPage.css';


const EDIT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13 5l4 4"/></svg>';
const STAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l2 5h5l-4 4 1.5 6L12 20 7.5 22 9 16 5 12h5z"/></svg>';
const USER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
const PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';

const AB_KEYS   = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const AB_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

function modStr(score) {
  const n = parseInt(score) || 10;
  const m = Math.floor((n - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

// Spell slots local state (session tracking only, not persisted)
const SLOT_INITIAL = {
  '1st': [true, true, true, true],
  '2nd': [true, true, true],
  '3rd': [true, true],
  'cd':  [true],
};

export default function MyCharacterPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const { character, loading, saveCharacter, deleteCharacter } = useMyCharacter(user?.uid);
  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [slots, setSlots] = useState(SLOT_INITIAL);
  const [lightbox, setLightbox] = useState(null);

  function togglePip(level, idx) {
    setSlots(prev => ({ ...prev, [level]: prev[level].map((v, i) => i === idx ? !v : v) }));
  }

  async function handleDelete() {
    setDeleting(true);
    try { await deleteCharacter(); } finally { setDeleting(false); setConfirmDelete(false); }
  }

  const slotRows = [
    { label: '1st level',        key: '1st' },
    { label: '2nd level',        key: '2nd' },
    { label: '3rd level',        key: '3rd' },
    { label: 'Channel Divinity', key: 'cd', divider: true },
  ];

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <SignInRequired
        {...{ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }}
        breadcrumb="My Character"
        message="Sign in to create and manage your character."
      />
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mc-app">
        <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />
        <div className="mc-main">
          <Topbar onToggleNav={onToggleNav} isDM={isDM} onToggleDM={onToggleDM} profile={profile} crumb={<>You › <b>My Character</b></>} />
          <div className="mc-empty"><p style={{ color: 'var(--ink-3)' }}>Loading…</p></div>
        </div>
      </div>
    );
  }

  // ── No character yet ──────────────────────────────────────────────────────
  if (!character) {
    return (
      <div className="mc-app">
        <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />
        <div className="mc-main">
          <Topbar onToggleNav={onToggleNav} isDM={isDM} onToggleDM={onToggleDM} profile={profile} crumb={<>You › <b>My Character</b></>} />
          <div className="mc-empty">
            <div dangerouslySetInnerHTML={{ __html: USER_SVG }} />
            <h2>No character yet</h2>
            <p>Create your character to appear in the party roster and track your stats.</p>
            <button className="btn primary" onClick={() => setModal(true)}
              dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Create my character' }} />
          </div>
        </div>
        {modal && <MyCharacterModal onSave={saveCharacter} onClose={() => setModal(false)} />}
      </div>
    );
  }

  // ── Character sheet ───────────────────────────────────────────────────────
  const ch = character;
  const hpPct = ch.hpMax > 0 ? Math.round((ch.hpCurrent / ch.hpMax) * 100) : 0;

  const vitals = [
    { k: 'Armor Class',  v: ch.ac,                    cls: 'ac' },
    { k: 'Hit Points',   v: `${ch.hpCurrent} / ${ch.hpMax}`, cls: 'hp', hpPct },
    { k: 'Initiative',   v: ch.initiative },
    { k: 'Speed',        v: ch.speed },
    { k: 'Prof. Bonus',  v: ch.profBonus },
  ];

  return (
    <div className="mc-app">
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

      <div className="mc-main">
        <Topbar
          onToggleNav={onToggleNav}
          isDM={isDM}
          onToggleDM={onToggleDM}
          profile={profile}
          crumb={<>You › <b>My Character</b></>}
          rightExtra={<>
            <button className="editbtn" onClick={() => setModal(true)}
              dangerouslySetInnerHTML={{ __html: EDIT_SVG + ' Edit sheet' }} />
            <button className="btn sm ghost" style={{ color: 'var(--blood)' }}
              onClick={() => setConfirmDelete(true)}>Delete</button>
          </>}
        />

        <div className="mc-wrap">
          {/* Identity hero */}
          <div className="mc-hero">
            <div className="mc-portrait">
              {ch.imageUrl
                ? <img className="pfr pfr-img" src={ch.imageUrl} alt={ch.name} onClick={() => setLightbox(ch.imageUrl)} style={{ cursor: 'zoom-in' }} />
                : <div className="pfr">
                    <span dangerouslySetInnerHTML={{ __html: USER_SVG }} />
                    {ch.name[0]}
                  </div>
              }
            </div>
            <div className="mc-identity">
              <div className="eyebrow">Player Character · {profile?.displayName || user.email}</div>
              <h1>{ch.name}</h1>
              <div className="cls">{[ch.race, ch.charClass, ch.level ? `Level ${ch.level}` : ''].filter(Boolean).join(' · ')}</div>
              <div className="badges">
                <span className="owntag">
                  <span dangerouslySetInnerHTML={{ __html: STAR_SVG }} />
                  Your character
                </span>
                {ch.subclass && <span className="chip">{ch.subclass}</span>}
                {ch.alignment && <span className="chip">{ch.alignment}</span>}
                {ch.background && <span className="chip">{ch.background}</span>}
              </div>
            </div>
          </div>

          {/* Vitals strip */}
          <div className="vitals">
            {vitals.map(v => (
              <div key={v.k} className={`vital${v.cls ? ' ' + v.cls : ''}`}>
                <div className="k">{v.k}</div>
                <div className="v">{v.v}</div>
                {v.hpPct != null && (
                  <div className="hpbar"><span style={{ width: `${v.hpPct}%` }} /></div>
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
                  {AB_KEYS.map(ab => (
                    <div key={ab} className="ability">
                      <div className="ab">{AB_LABELS[ab]}</div>
                      <div className="mod">{modStr(ch[ab])}</div>
                      <div className="sc">{ch[ab]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backstory */}
              {ch.backstory && (
                <div className="mc-sec">
                  <div className="sh"><h3>Backstory</h3></div>
                  <div className="mc-prose">{ch.backstory}</div>
                </div>
              )}
            </div>

            {/* Right column */}
            <aside className="mc-aside">
              {/* Spell Slots */}
              <div className="scard">
                <div className="sk">Spell Slots <span style={{ fontSize: 10, opacity: .5, fontWeight: 400 }}>(session only)</span></div>
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
            </aside>
          </div>
        </div>
      </div>

      {modal && (
        <MyCharacterModal
          initial={ch}
          onSave={saveCharacter}
          onClose={() => setModal(false)}
        />
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-hd"><h2>Delete Character</h2></div>
            <div className="modal-body">
              <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink-2)' }}>
                Delete <strong style={{ color: 'var(--ink)' }}>{ch.name}</strong>? This removes you from the party roster and cannot be undone.
              </p>
            </div>
            <div className="modal-ft">
              <button className="btn ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete character'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
