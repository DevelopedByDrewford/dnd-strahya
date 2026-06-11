import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './Sidebar';
import { TL_I, TIMELINE } from '../data/timeline';
import './TimelinePage.css';

const MENU_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
const SRAIL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h10M4 18h7"/></svg>';
const PLUS_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';

const KIND_BADGE = {
  milestone: <span className="ekind ms">Milestone</span>,
  dramatic:  <span className="ekind dr">Turning point</span>,
  now:       <span className="ekind nw">Most recent</span>,
};

function SessionRail({ activeId, onJump, isDM }) {
  return (
    <aside className="srail" id="srail">
      <div className="sh">Sessions</div>
      {TIMELINE.map(e => {
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

function TimelineEntry({ e, isDM, entryRef }) {
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
        {KIND_BADGE[e.kind] || null}
      </div>
      <div className="ecard">
        <h3>{e.title}</h3>
        <div className="eprose">{e.body}</div>
        <div className="echips">
          {e.links.map((l, i) => (
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

export default function TimelinePage({ isDM, onToggleDM, onToggleNav, onCloseNav }) {
  const [activeId, setActiveId]     = useState(TIMELINE[0].id);
  const [srailOpen, setSrailOpen]   = useState(false);
  const entryRefs = useRef({});

  useEffect(() => {
    document.body.classList.toggle('srail-open', srailOpen);
    return () => document.body.classList.remove('srail-open');
  }, [srailOpen]);

  const spy = useCallback(() => {
    const y = window.scrollY + 120;
    let cur = TIMELINE[0].id;
    TIMELINE.forEach(e => {
      const el = document.getElementById('entry-' + e.id);
      if (el && el.offsetTop <= y) cur = e.id;
    });
    setActiveId(cur);
  }, []);

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

  const milestoneCount = TIMELINE.filter(e => e.kind === 'milestone').length;
  const sessionCount   = TIMELINE.filter(e => !e.hidden).length;
  const dayCount       = 7;

  return (
    <div className="tl-app">
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} />

      <div className="tl-main">
        <div className="tl-topbar">
          <div className="tl-left">
            <button className="hamburger btn sm icon" onClick={onToggleNav}
              dangerouslySetInnerHTML={{ __html: MENU_SVG }} />
            <button className="srailToggle" onClick={() => setSrailOpen(o => !o)}
              dangerouslySetInnerHTML={{ __html: SRAIL_SVG }} />
            <span className="tl-crumb">Campaign › <b>Timeline</b></span>
          </div>
          <button className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
            <span className={`toggle${isDM ? ' on' : ''}`} />
            DM Mode
          </button>
        </div>

        <div className="tl-layout">
          <SessionRail activeId={activeId} onJump={scrollToEntry} isDM={isDM} />

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
              {TIMELINE.map(e => (
                <TimelineEntry
                  key={e.id}
                  e={e}
                  isDM={isDM}
                  entryRef={el => { entryRefs.current[e.id] = el; }}
                />
              ))}
              <div className="entry" style={{ marginBottom: 0 }}>
                <span className="node" style={{ borderStyle: 'dashed' }} />
                <button className="btn ghost" style={{ borderStyle: 'dashed' }}
                  dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Log a new entry' }} />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Shared scrim */}
      <div className="scrim" onClick={closeAll} />
    </div>
  );
}
