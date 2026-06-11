import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ROSTER, STATUS_ICONS, getChar } from '../data/characters';
import './CharactersPage.css';

const SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>';
const MENU_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
const EDIT_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2 2 0 013 3L12 15l-4 1 1-4z"/></svg>';
const SCROLL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 21h12M8 21a3 3 0 010-6h12v4.5A2.5 2.5 0 0117.5 22H8z"/><path d="M8 3h12v12H8z"/></svg>';
const FILTER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M6 12h12M9 18h6"/></svg>';
const PLUS_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';

const NOTE_LABELS = { pub: 'Public', priv: 'Private', dm: 'DM Only' };

function CharacterDetail({ id, isDM }) {
  const ch = getChar(id);
  const [noteFilter, setNoteFilter] = useState('all');

  const visibleNotes = ch.notes.filter(n => {
    if (n.scope === 'dm' && !isDM) return false;
    if (noteFilter === 'all') return true;
    return n.scope === noteFilter;
  });

  return (
    <div className="char-detail">

      {/* Hero */}
      <div className="char-hero">
        <div className="char-portrait">
          <span className="pini">{ch.name[0]}</span>
          <span>{ch.portrait}</span>
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
            <button className="btn sm" dangerouslySetInnerHTML={{ __html: EDIT_SVG + ' Edit' }} />
            <button className="btn sm" dangerouslySetInnerHTML={{ __html: SCROLL_SVG + ' Session Log' }} />
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

      {/* Stat Block — DM only */}
      {ch.statblock && (
        <div className="char-sec reveal-frame dm-only">
          <div className="char-sec-head"><h3>Stat Block</h3></div>
          <div className="char-sec-body">
            <div className="sblock-meta">
              <span><b>CR</b> {ch.statblock.cr}</span>
              <span><b>AC</b> {ch.statblock.ac}</span>
              <span><b>HP</b> {ch.statblock.hp}</span>
              <span><b>Speed</b> {ch.statblock.speed}</span>
            </div>
            <div className="sblock-abilities">
              {ch.statblock.abilities.map(([label, val, mod]) => (
                <div key={label} className="sab">
                  <div className="sal">{label}</div>
                  <div className="sav">{val}</div>
                  <div className="sam">{mod}</div>
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
      <div className="char-sec">
        <div className="char-sec-head">
          <h3>Notes</h3>
          <span dangerouslySetInnerHTML={{ __html: FILTER_SVG }} style={{ width: 16, height: 16, color: 'var(--ink-3)' }} />
        </div>
        <div className="char-sec-body">
          <div className="nfilters">
            {['all', 'pub', 'priv', ...(isDM ? ['dm'] : [])].map(f => (
              <button key={f} className={`nfilter${noteFilter === f ? ' on' : ''}`} onClick={() => setNoteFilter(f)}>
                {f === 'all' ? 'All' : NOTE_LABELS[f]}
              </button>
            ))}
          </div>
          {visibleNotes.map((n, i) => (
            <div key={i} className={`note ${n.scope}`}>
              <div className="note-head">
                <span className={`chip sm tag-${n.scope}`}>{NOTE_LABELS[n.scope]}</span>
                <span className="dim tiny">{n.who} · {n.when}</span>
              </div>
              <div className="note-body">{n.body}</div>
            </div>
          ))}
          <button className="btn sm ghost nadd">
            <span dangerouslySetInnerHTML={{ __html: PLUS_SVG }} />
            Add note
          </button>
        </div>
      </div>

    </div>
  );
}

export default function CharactersPage({ isDM, onToggleDM, onToggleNav, onCloseNav }) {
  const [selectedId, setSelectedId] = useState('strahd');
  const [rosterOpen, setRosterOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.body.classList.toggle('roster-open', rosterOpen);
    return () => document.body.classList.remove('roster-open');
  }, [rosterOpen]);

  function selectChar(id) {
    setSelectedId(id);
    setRosterOpen(false);
  }

  function closeAll() {
    onCloseNav();
    setRosterOpen(false);
  }

  const q = query.toLowerCase();
  const filteredRoster = ROSTER.map(grp => ({
    ...grp,
    items: grp.items.filter(it =>
      (!grp.dm || isDM) &&
      (!it.dm || isDM) &&
      (q === '' || it.n.toLowerCase().includes(q) || it.r.toLowerCase().includes(q))
    ),
  })).filter(grp => grp.items.length > 0);

  return (
    <div className="char-app">
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} />

      <div className="char-main">
        <div className="char-topbar">
          <button className="rosterToggle" onClick={() => setRosterOpen(o => !o)}
            dangerouslySetInnerHTML={{ __html: MENU_SVG }} />
          <button className="hamburger btn sm icon" onClick={onToggleNav}
            dangerouslySetInnerHTML={{ __html: MENU_SVG }} />
          <div className="char-crumb">
            <Link to="/">Home</Link>
            <span className="sep">›</span>
            <b>Characters</b>
          </div>
          <button
            className={`dmswitch${isDM ? ' on' : ''}`}
            onClick={onToggleDM}
          >
            <span className={`toggle${isDM ? ' on' : ''}`} />
            DM Mode
          </button>
        </div>

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
            </div>
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
          <CharacterDetail key={selectedId} id={selectedId} isDM={isDM} />

        </div>
      </div>

      {/* Shared scrim */}
      <div className="scrim" onClick={closeAll} />
    </div>
  );
}
