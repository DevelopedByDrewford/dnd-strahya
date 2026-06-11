import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ACTIVITY, PRESENCE, REC_I, ACT_I, REC_ROUTES } from '../data/activity';
import './ActivityPage.css';

const MENU_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

const FILTERS = [
  { key: 'all',     label: 'All',        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' },
  { key: 'mine',    label: 'Mine',       icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>' },
  { key: 'note',    label: 'Notes',      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h11l3 3v13H5z"/></svg>' },
  { key: 'quest',   label: 'Quests',     icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3v18l4-3 4 3V3z"/><path d="M13 3h6v15"/></svg>' },
  { key: 'loot',    label: 'Loot',       icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9h16v10H4z"/><path d="M4 9l2-4h12l2 4"/></svg>' },
  { key: 'char',    label: 'Characters', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>' },
  { key: 'reveal',  label: 'Reveals',    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>' },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function initials(name) {
  return name.replace(/\(.*\)/, '').trim()[0] || '?';
}

function groupByDay(items) {
  const groups = [];
  const seen = {};
  for (const item of items) {
    if (!seen[item.day]) {
      seen[item.day] = [];
      groups.push([item.day, seen[item.day]]);
    }
    seen[item.day].push(item);
  }
  return groups;
}

// ── sub-components ────────────────────────────────────────────────────────────

function PresenceBar() {
  return (
    <div className="act-presbar">
      {PRESENCE.map((p, i) => (
        <span
          key={p.n}
          className="act-pav"
          style={{ borderColor: p.color }}
          title={p.n}
        >
          {p.n[0]}
        </span>
      ))}
      <span className="act-pcount">{PRESENCE.length} here now</span>
    </div>
  );
}

function RecordLink({ name, type, secondary }) {
  const route = REC_ROUTES[type] || '#';
  if (secondary) {
    return (
      <Link className="act-rlink sm" to={route}>
        {name}
      </Link>
    );
  }
  return (
    <Link className="act-rlink" to={route}>
      <span className="act-ri" dangerouslySetInnerHTML={{ __html: REC_I[type] || '' }} />
      {name}
    </Link>
  );
}

function ScopeTag({ scope }) {
  if (!scope) return null;
  const label = scope === 'pub' ? 'public' : scope === 'priv' ? 'private' : 'DM';
  return <span className={`act-sc ${scope}`}>{label}</span>;
}

function ActivityItem({ item }) {
  const isDmItem = !!item.dm;
  return (
    <div
      className={`act-item${isDmItem ? ' dm-only reveal-frame' : ''}`}
      style={isDmItem ? { '--d': 'flex' } : undefined}
    >
      <span
        className={`act-verb${isDmItem ? ' dm-verb' : ''}`}
        dangerouslySetInnerHTML={{ __html: ACT_I[item.act] || ACT_I.edit }}
      />
      <div className="act-ibody">
        <div className="act-iline">
          <span className="av" style={{ width: 24, height: 24, fontSize: 11 }}>
            {initials(item.who)}
          </span>
          <span className="act-who">{item.who}</span>
          <span className="act-txt">{item.text}</span>
          {item.rec && <RecordLink name={item.rec} type={item.recType} />}
          {item.recSecond && (
            <>
              <span className="dim">·</span>
              <RecordLink name={item.recSecond} type={item.recType} secondary />
            </>
          )}
          <ScopeTag scope={item.scope} />
        </div>
        <div className="act-imeta">
          {item.when}
          {item.extra && <> · <span className="extra">{item.extra}</span></>}
        </div>
      </div>
    </div>
  );
}

function ActivityStream({ items }) {
  if (!items.length) {
    return <div className="act-empty">No activity matches this filter.</div>;
  }
  const groups = groupByDay(items);
  return (
    <div className="act-stream">
      {groups.map(([day, dayItems]) => (
        <div key={day} className="act-daygrp">
          <div className="act-dh">{day}</div>
          {dayItems.map(item => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── ActivityPage ──────────────────────────────────────────────────────────────

export default function ActivityPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [activeCat, setActiveCat] = useState('all');

  const visibleItems = useMemo(() => {
    return ACTIVITY.filter(a => {
      if (a.dm && !isDM) return false;
      if (activeCat === 'all')  return true;
      if (activeCat === 'mine') return a.who === 'You' || a.who === 'You (DM)' || a.who === 'Tessa';
      return a.cat === activeCat;
    });
  }, [activeCat, isDM]);

  const allCount = ACTIVITY.filter(a => !a.dm || isDM).length;

  return (
    <div className="act-app">
      <div className="scrim" onClick={onCloseNav} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

        <div className="act-main">
          <div className="act-topbar">
            <div className="act-crumb">
              <button
                className="hamburger btn sm icon ghost"
                onClick={onToggleNav}
                dangerouslySetInnerHTML={{ __html: MENU_SVG }}
              />
              <span>
                <Link to="/">Home</Link> › <b>Activity</b>
              </span>
            </div>
            <div className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
              <span className={`toggle${isDM ? ' on' : ''}`} />
              DM Mode
            </div>
          </div>

          <div className="act-wrap">
            {/* Header */}
            <div className="act-head">
              <div>
                <div className="eyebrow">The campaign, as it unfolds</div>
                <h1>Activity</h1>
              </div>
              <PresenceBar />
            </div>

            {/* Filter bar */}
            <div className="act-filterbar">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`act-fchip${activeCat === f.key ? ' on' : ''}`}
                  onClick={() => setActiveCat(f.key)}
                >
                  <span dangerouslySetInnerHTML={{ __html: f.icon }} />
                  {f.label}
                  {f.key === 'all' && <span className="c">{allCount}</span>}
                </button>
              ))}
            </div>

            {/* Stream */}
            <ActivityStream items={visibleItems} />

            {/* Load more */}
            <div className="act-loadmore">
              <button className="btn ghost">Load earlier activity</button>
            </div>
          </div>
        </div>
      </div>
  );
}
