import { useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useState } from 'react';
import { REC_I, ACT_I } from '../data/activity';
import { usePresenceList } from '../hooks/usePresence';
import PlayersModal from '../components/PlayersModal';
import { useActivity } from '../hooks/useActivity';
import './ActivityPage.css';


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
// ── sub-components ────────────────────────────────────────────────────────────

const PRESENCE_COLORS = ['var(--gold-2)', 'var(--live)', '#7ba4c4', '#c4907b', '#a47bc4', '#c4b87b'];
function presenceColor(uid) {
  let h = 0;
  for (const c of uid) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return PRESENCE_COLORS[Math.abs(h) % PRESENCE_COLORS.length];
}

function PresenceBar({ userId, onOpen }) {
  const presenceList = usePresenceList({ userId });
  if (!presenceList.length) return null;
  return (
    <button className="act-presbar" onClick={onOpen} title="See all players">
      {presenceList.map(p => (
        <span
          key={p.uid}
          className="act-pav"
          style={{ borderColor: p.uid === userId ? 'var(--gold-2)' : presenceColor(p.uid) }}
        >
          {(p.displayName || '?')[0].toUpperCase()}
        </span>
      ))}
      <span className="act-pcount">{presenceList.length} here now</span>
    </button>
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

const VALID_FILTERS = new Set(FILTERS.map(f => f.key));

export default function ActivityPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = VALID_FILTERS.has(searchParams.get('filter')) ? searchParams.get('filter') : 'all';
  const { activity, loading } = useActivity({ isDM, userId: user?.uid });
  const [playersOpen, setPlayersOpen] = useState(false);

  function setFilter(key) {
    setSearchParams(key === 'all' ? {} : { filter: key }, { replace: true });
  }

  return (
    <>
    <div className="act-app">
      <div className="scrim" onClick={onCloseNav} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

        <div className="act-main">
          <Topbar
            onToggleNav={onToggleNav}
            isDM={isDM}
            onToggleDM={onToggleDM}
            profile={profile}
            crumb={<><Link to="/">Home</Link><span className="sep">›</span><b>Activity</b></>}
          />

          <div className="act-wrap">
            {/* Header */}
            <div className="act-head">
              <div>
                <div className="eyebrow">The campaign, as it unfolds</div>
                <h1>Activity</h1>
              </div>
              <PresenceBar userId={user?.uid} onOpen={() => setPlayersOpen(true)} />
            </div>

            {/* Filter bar */}
            <div className="act-filterbar">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`act-fchip${activeCat === f.key ? ' on' : ''}`}
                  onClick={() => setFilter(f.key)}
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
      {playersOpen && (
        <PlayersModal currentUserId={user?.uid} onClose={() => setPlayersOpen(false)} />
      )}
    </>
  );
}
