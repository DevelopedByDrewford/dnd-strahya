import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { PRESENCE, REC_I, ACT_I, REC_ROUTES } from '../data/activity';
import { useActivity } from '../hooks/useActivity';
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

function initials(name = '?') {
  return name.replace(/\(.*\)/, '').trim()[0] || '?';
}

function timeAgo(ts) {
  if (!ts?.toMillis) return '—';
  const diff = Date.now() - ts.toMillis();
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return new Date(ts.toMillis()).toLocaleDateString();
}

function dayLabel(ts) {
  if (!ts?.toMillis) return 'Unknown';
  const d = new Date(ts.toMillis());
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDay(notes) {
  const groups = [];
  const seen = {};
  for (const n of notes) {
    const key = dayLabel(n.createdAt);
    if (!seen[key]) { seen[key] = []; groups.push([key, seen[key]]); }
    seen[key].push(n);
  }
  return groups;
}

const TYPE_ROUTE = { location: '/locations', character: '/characters', quest: '/quests' };
const SCOPE_LABEL = { pub: 'public', priv: 'private', dm: 'DM' };

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

function NoteActivityItem({ note }) {
  const isDmNote = note.scope === 'dm';
  const route = TYPE_ROUTE[note.entityType] || '#';
  return (
    <div
      className={`act-item${isDmNote ? ' dm-only reveal-frame' : ''}`}
      style={isDmNote ? { '--d': 'flex' } : undefined}
    >
      <span className={`act-verb${isDmNote ? ' dm-verb' : ''}`}
        dangerouslySetInnerHTML={{ __html: ACT_I.note || ACT_I.edit }} />
      <div className="act-ibody">
        <div className="act-iline">
          <span className="av" style={{ width: 24, height: 24, fontSize: 11 }}>{initials(note.who)}</span>
          <span className="act-who">{note.who}</span>
          <span className="act-txt">noted on</span>
          <Link className="act-rlink" to={route}>
            <span className="act-ri" dangerouslySetInnerHTML={{ __html: REC_I[note.entityType] || REC_I.note || '' }} />
            {note.entityName}
          </Link>
          <ScopeTag scope={note.scope} />
        </div>
        <div className="act-imeta">{timeAgo(note.createdAt)}</div>
        {note.body && note.scope !== 'priv' && (
          <div className="act-preview">"{note.body.slice(0, 120)}{note.body.length > 120 ? '…' : ''}"</div>
        )}
      </div>
    </div>
  );
}

function ActivityStream({ notes, filter, userId }) {
  const visible = notes.filter(n => {
    if (filter === 'note')   return true;
    if (filter === 'mine')   return n.authorId === userId;
    if (filter === 'quest')  return n.entityType === 'quest';
    if (filter === 'char')   return n.entityType === 'character';
    return true;
  });

  if (!visible.length) {
    return <div className="act-empty">No activity yet. Notes added to locations, characters, and quests will appear here.</div>;
  }

  const groups = groupByDay(visible);
  return (
    <div className="act-stream">
      {groups.map(([day, dayNotes]) => (
        <div key={day} className="act-daygrp">
          <div className="act-dh">{day}</div>
          {dayNotes.map(n => <NoteActivityItem key={n.id} note={n} />)}
        </div>
      ))}
    </div>
  );
}

// ── ActivityPage ──────────────────────────────────────────────────────────────

export default function ActivityPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [activeCat, setActiveCat] = useState('all');
  const { activity, loading } = useActivity({ isDM, userId: user?.uid });

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
                  {f.key === 'all' && <span className="c">{activity.length}</span>}
                </button>
              ))}
            </div>

            {/* Stream */}
            {loading
              ? <div className="act-empty">Loading…</div>
              : <ActivityStream notes={activity} filter={activeCat} userId={user?.uid} />
            }
          </div>
        </div>
      </div>
  );
}
