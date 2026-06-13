import { useAllUsers, useAllPresence } from '../hooks/usePresence';
import './PlayersModal.css';

const STALE_MS = 3 * 60_000;

const COLORS = ['var(--gold-2)', 'var(--live)', '#7ba4c4', '#c4907b', '#a47bc4', '#c4b87b'];
function avatarColor(uid = '') {
  let h = 0;
  for (const c of uid) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

function timeAgo(ts) {
  if (!ts?.toMillis) return null;
  const diff = Date.now() - ts.toMillis();
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function PlayerCard({ user, presence, isYou }) {
  const name = user.displayName || '?';
  const online = presence && (Date.now() - (presence.lastSeen?.toMillis?.() ?? 0)) < STALE_MS;
  const color = isYou ? 'var(--gold-2)' : avatarColor(user.uid);
  const lastSeen = presence ? timeAgo(presence.lastSeen) : null;

  return (
    <div className={`pm-card${online ? ' pm-online' : ''}`}>
      <div className="pm-av" style={{ borderColor: color }}>
        {user.avatarUrl
          ? <img src={user.avatarUrl} alt={name} />
          : <span>{name[0].toUpperCase()}</span>
        }
        <span className={`pm-dot${online ? ' on' : ''}`} />
      </div>
      <div className="pm-info">
        <div className="pm-name">{name}{isYou && <span className="pm-you">you</span>}</div>
        <div className="pm-meta">
          <span className="pm-role">{user.role === 'dm' ? 'Dungeon Master' : 'Player'}</span>
          {online
            ? <span className="pm-status online">● Online</span>
            : lastSeen
              ? <span className="pm-status">Last seen {lastSeen}</span>
              : <span className="pm-status">Offline</span>
          }
        </div>
      </div>
    </div>
  );
}

export default function PlayersModal({ onClose, currentUserId }) {
  const users = useAllUsers();
  const allPresence = useAllPresence();

  const presenceByUid = Object.fromEntries(allPresence.map(p => [p.uid, p]));

  const sorted = [...users].sort((a, b) => {
    const aOnline = presenceByUid[a.uid] && (Date.now() - (presenceByUid[a.uid].lastSeen?.toMillis?.() ?? 0)) < STALE_MS;
    const bOnline = presenceByUid[b.uid] && (Date.now() - (presenceByUid[b.uid].lastSeen?.toMillis?.() ?? 0)) < STALE_MS;
    if (aOnline !== bOnline) return aOnline ? -1 : 1;
    if (a.uid === currentUserId) return -1;
    if (b.uid === currentUserId) return 1;
    return (a.displayName || '').localeCompare(b.displayName || '');
  });

  const onlineCount = sorted.filter(u => {
    const p = presenceByUid[u.uid];
    return p && (Date.now() - (p.lastSeen?.toMillis?.() ?? 0)) < STALE_MS;
  }).length;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box pm-box">
        <div className="modal-hd">
          <h2>Players <span className="pm-hcount">{onlineCount} online</span></h2>
          <button className="btn icon ghost" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="pm-list">
          {sorted.map(u => (
            <PlayerCard
              key={u.uid}
              user={u}
              presence={presenceByUid[u.uid]}
              isYou={u.uid === currentUserId}
            />
          ))}
          {!sorted.length && <p className="muted" style={{ padding: '12px 0' }}>No players found.</p>}
        </div>
      </div>
    </div>
  );
}
