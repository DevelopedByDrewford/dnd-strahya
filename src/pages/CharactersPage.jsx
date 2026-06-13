import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import CharacterModal from '../components/CharacterModal';
import NotesList from '../components/NotesList';
import { STATUS_ICONS } from '../data/characters';
import { useCharacters } from '../hooks/useCharacters';
import ImageLightbox from '../components/ImageLightbox';
import './CharactersPage.css';

const SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>';

const EDIT_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2 2 0 013 3L12 15l-4 1 1-4z"/></svg>';
const SCROLL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 21h12M8 21a3 3 0 010-6h12v4.5A2.5 2.5 0 0117.5 22H8z"/><path d="M8 3h12v12H8z"/></svg>';
const PLUS_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';


// create variable 'hello' 

function CharacterDetail({ ch, isDM, onEdit, onDelete, user, profile, onImageClick }) {

  return (
    <div className="char-detail">

      {/* Hero */}
      <div className="char-hero">
        <div className="char-portrait">
          {ch.imageUrl
            ? <img
                className="char-pfr-img"
                src={ch.imageUrl}
                alt={ch.name}
                onClick={() => onImageClick(ch.imageUrl)}
              />
            : <>
                <span className="pini">{ch.name[0]}</span>
                <span>{ch.portrait}</span>
              </>
          }
        </div>
        <div className="char-meta">
          <h1 className="char-name">{ch.name}</h1>
          <p className="char-sub">{ch.sub}</p>
          <div className="char-statuses">
            {ch.statuses.map((s, i) => (
              <span key={i} className={`chip sm ${s.c === 'bad' ? 'blood' : s.c === 'good' ? 'live' : ''}`}>
                <span dangerouslySetInnerHTML={{ __html: STATUS_ICONS[s.i] || '' }} />
                {s.t}
              </span>
            ))}
          </div>
          <div className="char-actions">
            {isDM && ch.firestore && (
              <>
                <button className="btn sm" onClick={onEdit} dangerouslySetInnerHTML={{ __html: EDIT_SVG + ' Edit' }} />
                <button className="btn sm ghost" onClick={onDelete} style={{ color: 'var(--blood)' }} dangerouslySetInnerHTML={{ __html: SCROLL_SVG + ' Delete' }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="char-facts">
        {ch.facts.map((f, i) => (
          <div key={i} className="cfact">
            <div className="ck">{f.k}</div>
            <div className={`cv${f.link ? ' link' : ''}`}>{f.v}</div>
          </div>
        ))}
      </div>

      {/* Appearance */}
      <div className="char-sec">
        <div className="char-sec-head"><h3>Appearance</h3></div>
        <div className="char-sec-body">
          <div className="char-prose">
            {ch.appearance.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>

      {/* Personality */}
      {ch.personality && (
        <div className="char-sec">
          <div className="char-sec-head"><h3>Personality</h3></div>
          <div className="char-sec-body">
            <p className="char-prose">{ch.personality}</p>
          </div>
        </div>
      )}

      {/* Secrets — DM only */}
      {ch.secret && (
        <div className="char-sec reveal-frame dm-only">
          <div className="char-sec-head"><h3>Secrets &amp; True Motives</h3></div>
          <div className="char-sec-body">
            <p className="char-prose">{ch.secret}</p>
          </div>
        </div>
      )}

      {/* Stat Block */}
      {ch.statblock && (
        <div className={`char-sec${ch.group !== 'The Party' ? ' reveal-frame dm-only' : ''}`}>
          <div className="char-sec-head"><h3>Stat Block</h3></div>
          <div className="char-sec-body">
            <div className="sblock-meta">
              {ch.statblock.cr != null && <span><b>CR</b> {ch.statblock.cr}</span>}
              <span><b>AC</b> {ch.statblock.ac}</span>
              <span><b>HP</b> {ch.statblock.hp}</span>
              <span><b>Speed</b> {ch.statblock.speed}</span>
            </div>
            <div className="sblock-abilities">
              {ch.statblock.abilities.map(a => (
                <div key={a.stat} className="sab">
                  <div className="sal">{a.stat}</div>
                  <div className="sav">{a.val}</div>
                  <div className="sam">{a.mod}</div>
                </div>
              ))}
            </div>
            <div className="sblock-traits">
              {ch.statblock.traits.map((tr, i) => (
                <p key={i} className="strait"><b>{tr.n}.</b> {tr.d}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tactics — DM only */}
      {ch.tactics && (
        <div className="char-sec reveal-frame dm-only">
          <div className="char-sec-head"><h3>Tactics</h3></div>
          <div className="char-sec-body">
            <p className="char-prose">{ch.tactics}</p>
          </div>
        </div>
      )}

      {/* Relationships */}
      {ch.rels.length > 0 && (
        <div className="char-sec">
          <div className="char-sec-head"><h3>Relationships</h3></div>
          <div className="char-sec-body">
            <div className="char-rels">
              {ch.rels.filter(r => !r.dm || isDM).map((r, i) => (
                <div key={i} className={`relcard${r.dm ? ' dm-only' : ''}`}>
                  <div className="reln">{r.n}</div>
                  <div className="relt">{r.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes Rail */}
      <div className="char-sec char-notes-rail">
        <NotesList
          entityId={ch.id}
          entityType="character"
          entityName={ch.name}
          user={user}
          profile={profile}
          isDM={isDM}
        />
      </div>

    </div>
  );
}

export default function CharactersPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mergedRoster, getChar, loading, seeded, addCharacter, updateCharacter, deleteCharacter, seedCharacters } = useCharacters({ isDM });
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || 'strahd');
  const [rosterOpen, setRosterOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(searchParams.get('new') === 'true' ? { mode: 'create' } : null);
  const [seeding, setSeeding] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (searchParams.get('new') !== 'true') return;
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('new'); return n; }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  useEffect(() => {
    document.body.classList.toggle('roster-open', rosterOpen);
    return () => document.body.classList.remove('roster-open');
  }, [rosterOpen]);

  function selectChar(id) {
    setSelectedId(id);
    setSearchParams({ id }, { replace: true });
    setRosterOpen(false);
  }

  function closeAll() {
    onCloseNav();
    setRosterOpen(false);
  }

  async function handleSeed() {
    setSeeding(true);
    try { await seedCharacters(); } finally { setSeeding(false); }
  }

  function openCreate() {
    setModal({ mode: 'create' });
  }

  function openEdit() {
    const ch = getChar(selectedId);
    setModal({ mode: 'edit', id: selectedId, char: ch });
  }

  async function handleSave(data) {
    if (modal.mode === 'create') {
      const ref = await addCharacter(data);
      selectChar(ref.id);
    } else {
      await updateCharacter(modal.id, data);
    }
  }

  async function handleDelete() {
    const ch = getChar(selectedId);
    if (!window.confirm(`Delete "${ch.name}"? This cannot be undone.`)) return;
    selectChar('strahd');
    await deleteCharacter(selectedId);
  }

  const q = query.toLowerCase();
  const filteredRoster = mergedRoster.map(grp => ({
    ...grp,
    items: grp.items.filter(it =>
      (!grp.dm || isDM) &&
      (!it.dm || isDM) &&
      (q === '' || it.n.toLowerCase().includes(q) || it.r.toLowerCase().includes(q))
    ),
  })).filter(grp => grp.items.length > 0);

  return (
    <div className="char-app">
      <div className="scrim" onClick={closeAll} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

      <div className="char-main">
        <Topbar
          onToggleNav={onToggleNav}
          isDM={isDM}
          onToggleDM={onToggleDM}
          profile={profile}
          leftExtra={
            <button className="rosterToggle" onClick={() => setRosterOpen(o => !o)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="7" r="3"/><path d="M3 21c0-4 2.7-6 6-6s6 2 6 6"/>
                <circle cx="17" cy="9" r="2.5"/><path d="M21 21c0-3-1.5-4.5-4-5"/>
              </svg>
            </button>
          }
          crumb={<><Link to="/">World</Link><span className="sep">›</span><b>Characters</b></>}
        />

        <div className="char-layout">

          {/* Roster panel */}
          <aside className="roster">
            <div className="roster-head">
              <div className="rsearch">
                <span dangerouslySetInnerHTML={{ __html: SEARCH_SVG }} />
                <input
                  placeholder="Filter characters…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              {isDM && (
                <button className="btn sm ghost rnadd" onClick={openCreate} dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' New' }} />
              )}
            </div>
            {!loading && !seeded && isDM && (
              <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>No characters yet.</p>
                <button className="btn sm primary" onClick={handleSeed} disabled={seeding}>
                  {seeding ? 'Seeding…' : 'Import sample data'}
                </button>
              </div>
            )}
            <div className="roster-groups">
              {filteredRoster.map(grp => (
                <div key={grp.grp} className={grp.dm ? 'dm-only' : undefined}>
                  <div className="rgrp-head">
                    <span className="eyebrow">{grp.grp}</span>
                    <span className="dim tiny">{grp.items.length}</span>
                  </div>
                  {grp.items.map(it => (
                    <div
                      key={it.id}
                      className={`rcard${selectedId === it.id ? ' sel' : ''}${it.dm ? ' dm-only' : ''}`}
                      onClick={() => selectChar(it.id)}
                    >
                      <div className="rav">{it.n[0]}</div>
                      <div className="rinfo">
                        <div className="rname">{it.n}</div>
                        <div className="rrole">{it.r}</div>
                      </div>
                      <div className="rdot">
                        <span className={`rdot-${it.dot}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* Character detail */}
          {getChar(selectedId) && (
            <CharacterDetail key={selectedId} ch={getChar(selectedId)} isDM={isDM} onEdit={openEdit} onDelete={handleDelete} user={user} profile={profile} onImageClick={setLightbox} />
          )}

        </div>
      </div>

      {modal && (
        <CharacterModal
          initial={modal.mode === 'edit' ? modal.char : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
