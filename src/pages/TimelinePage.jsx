import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TimelineEntryModal from '../components/TimelineEntryModal';
import { TL_I } from '../data/timeline';
import { useTimeline } from '../hooks/useTimeline';
import './TimelinePage.css';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

const MENU_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
const SRAIL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h10M4 18h7"/></svg>';
const PLUS_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';

const KIND_BADGE = {
  milestone: <span className="ekind ms">Milestone</span>,
  dramatic:  <span className="ekind dr">Turning point</span>,
  now:       <span className="ekind nw">Most recent</span>,
};

function SessionRail({ entries, activeId, onJump, isDM }) {
  return (
    <aside className="srail" id="srail">
      <div className="sh">Sessions</div>
      {entries.map(e => {
        if (e.hidden && !isDM) return null;
        const num = e.session.replace(/[^0-9–]/g, '');
        return (
          <div
            key={e.id}
            className={`sjump${activeId === e.id ? ' sel' : ''}${e.hidden ? ' dm-only dmj' : ''}`}
            style={e.hidden ? { '--d': 'flex' } : undefined}
            onClick={() => onJump(e.id)}
          >
            <span className="sn">{e.hidden ? '⛓' : (num || '✦')}</span>
            <div style={{ minWidth: 0 }}>
              <div className="st">{e.title}</div>
              <div className="sd">{e.session}</div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}

function TimelineEntry({ e, isDM, isNewest, entryRef, onEdit, onDelete }) {
  if (e.hidden && !isDM) return null;

  const dmNote = e.dmNote
    ? e.hidden
      ? (
        <div className="dmnote hidden-prep">
          <div className="dl"><span className="dt">⛓ DM prep</span></div>
          <div className="db">{e.dmNote}</div>
        </div>
      )
      : (
        <div className="dmnote player-foreshadow dm-only reveal-frame" style={{ '--d': 'block' }}>
          <div className="dl"><span className="dt">⛓ DM — Foreshadowing</span></div>
          <div className="db">{e.dmNote}</div>
        </div>
      )
    : null;

  return (
    <article
      ref={entryRef}
      id={`entry-${e.id}`}
      data-id={e.id}
      className={[
        'entry',
        e.kind || '',
        e.hidden ? 'dm-only reveal-frame' : '',
      ].filter(Boolean).join(' ')}
      style={e.hidden ? { '--d': 'block' } : undefined}
    >
      <span className="node" />
      <div className="ehead">
        <span className="slabel">{e.session}</span>
        <span className="day">{e.day}</span>
        {isNewest && KIND_BADGE.now}
        {e.kind !== 'now' && (KIND_BADGE[e.kind] || null)}
        {isDM && (
          <span className="entry-dm-actions dm-only" style={{ '--d': 'inline-flex' }}>
            <button className="btn xs ghost" onClick={() => onEdit(e)} title="Edit entry">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button className="btn xs ghost danger" onClick={() => onDelete(e)} title="Delete entry">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              Delete
            </button>
          </span>
        )}
      </div>
      <div className="ecard">
        <h3>{e.title}</h3>
        <div className="eprose">{e.body}</div>
        <div className="echips">
          {(e.links || []).map((l, i) => (
            <span key={i} className={`lchip ${l.c || ''}`}>
              <span dangerouslySetInnerHTML={{ __html: TL_I[l.t] || '' }} />
              {l.n}
            </span>
          ))}
        </div>
        {e.author && (
          <div className="eauthor">
            <span dangerouslySetInnerHTML={{ __html: TL_I.user }} />
            {e.author}
          </div>
        )}
        {dmNote}
      </div>
    </article>
  );
}

export default function TimelinePage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { entries, loading, addEntry, updateEntry, deleteEntry, seedEntries } = useTimeline(CAMPAIGN_ID, { isDM });
  const [activeId, setActiveId]     = useState(null);
  const [srailOpen, setSrailOpen]   = useState(false);
  const [modalEntry, setModalEntry] = useState(searchParams.get('new') === 'true' ? null : undefined); // undefined = closed, null = new, obj = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') !== 'true') return;
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('new'); return n; }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSeed() {
    setSeeding(true);
    try { await seedEntries(); } finally { setSeeding(false); }
  }
  const entryRefs = useRef({});

  const visible = isDM ? entries : entries.filter(e => !e.hidden);

  useEffect(() => {
    if (entries.length && !activeId) setActiveId(entries[0].id);
  }, [entries, activeId]);

  useEffect(() => {
    document.body.classList.toggle('srail-open', srailOpen);
    return () => document.body.classList.remove('srail-open');
  }, [srailOpen]);

  const spy = useCallback(() => {
    const y = window.scrollY + 120;
    let cur = visible[0]?.id;
    visible.forEach(e => {
      const el = document.getElementById('entry-' + e.id);
      if (el && el.offsetTop <= y) cur = e.id;
    });
    if (cur) setActiveId(cur);
  }, [visible]);

  useEffect(() => {
    window.addEventListener('scroll', spy, { passive: true });
    spy();
    return () => window.removeEventListener('scroll', spy);
  }, [spy]);

  function scrollToEntry(id) {
    const el = document.getElementById('entry-' + id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 66, behavior: 'smooth' });
    setSrailOpen(false);
  }

  function closeAll() {
    onCloseNav();
    setSrailOpen(false);
  }

  async function handleSave(data) {
    if (modalEntry?.id) {
      await updateEntry(modalEntry.id, data);
    } else {
      await addEntry(data);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEntry(deleteTarget.id);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const milestoneCount = visible.filter(e => e.kind === 'milestone').length;
  const sessionCount   = visible.filter(e => !e.hidden).length;
  const dayCount       = 7;

  return (
    <div className="tl-app">
      <div className="scrim" onClick={closeAll} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

      <div className="tl-main">
        <div className="tl-topbar">
          <div className="tl-left">
            <button className="hamburger btn sm icon" onClick={onToggleNav}
              dangerouslySetInnerHTML={{ __html: MENU_SVG }} />
            <button className="srailToggle" onClick={() => setSrailOpen(o => !o)}
              dangerouslySetInnerHTML={{ __html: SRAIL_SVG }} />
            <span className="tl-crumb">Campaign › <b>Timeline</b></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Resync Seed Data for Timeline */}
            {/* {isDM && entries.length > 0 && (
              <button
                className="btn sm ghost dm-only"
                style={{ '--d': 'inline-flex' }}
                onClick={handleSeed}
                disabled={seeding}
                title="Patch hidden:false onto existing entries so players can see them"
              >
                {seeding ? 'Syncing…' : 'Resync data'}
              </button>
            )} */}
            {isDM && (
              <button
                className="btn sm dm-only"
                style={{ '--d': 'inline-flex' }}
                onClick={() => setModalEntry(null)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}>
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                New Entry
              </button>
            )}
            {profile?.role === 'dm' && (
              <button className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
                <span className={`toggle${isDM ? ' on' : ''}`} />
                DM Mode
              </button>
            )}
          </div>
        </div>

        <div className="tl-layout">
          <SessionRail entries={visible} activeId={activeId} onJump={scrollToEntry} isDM={isDM} />

          <section className="chron">
            <div className="chero">
              <div className="eyebrow">The Chronicle of Barovia</div>
              <h1>The Story So Far</h1>
              <div className="sub">734 · Waning of the Crow Moon — Day {dayCount} of the mists</div>
              <div className="cstats">
                <div className="cstat"><b>{sessionCount}</b><span>Sessions</span></div>
                <div className="cstat"><b>{dayCount}</b><span>In-world days</span></div>
                <div className="cstat"><b>{milestoneCount}</b><span>Milestones</span></div>
              </div>
            </div>

            <div className="spine">
              {!loading && entries.length === 0 && isDM && (
                <div className="entry" style={{ marginBottom: 0 }}>
                  <span className="node" style={{ borderStyle: 'dashed' }} />
                  <div className="ecard" style={{ textAlign: 'center', padding: '32px 24px' }}>
                    <p style={{ color: 'var(--ink-3)', marginBottom: 16 }}>No timeline entries yet.</p>
                    <button className="btn primary" onClick={handleSeed} disabled={seeding}>
                      {seeding ? 'Seeding…' : 'Import sample campaign data'}
                    </button>
                  </div>
                </div>
              )}
              {visible.map((e, i) => (
                <TimelineEntry
                  key={e.id}
                  e={e}
                  isDM={isDM}
                  isNewest={i === 0}
                  entryRef={el => { entryRefs.current[e.id] = el; }}
                  onEdit={setModalEntry}
                  onDelete={setDeleteTarget}
                />
              ))}
              {isDM && (
                <div className="entry addentry dm-only" style={{ '--d': 'block', marginBottom: 0 }}>
                  <span className="node" style={{ borderStyle: 'dashed' }} />
                  <button
                    className="btn ghost"
                    style={{ borderStyle: 'dashed' }}
                    onClick={() => setModalEntry(null)}
                    dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Log a new entry' }}
                  />
                </div>
              )}
              {!isDM && (
                <div className="entry" style={{ marginBottom: 0 }}>
                  <span className="node" style={{ borderStyle: 'dashed' }} />
                  <button className="btn ghost" style={{ borderStyle: 'dashed' }}
                    dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Log a new entry' }} />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {modalEntry !== undefined && (
        <TimelineEntryModal
          entry={modalEntry}
          defaultAuthor={profile?.displayName ?? user?.email ?? ''}
          onSave={handleSave}
          onClose={() => setModalEntry(undefined)}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-hd">
              <h2>Delete Entry</h2>
            </div>
            <div className="modal-body">
              <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink-2)' }}>
                Delete <strong style={{ color: 'var(--ink)' }}>"{deleteTarget.title}"</strong>? This cannot be undone.
              </p>
            </div>
            <div className="modal-ft">
              <button className="btn ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
