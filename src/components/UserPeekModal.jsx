import { useAllUsers, useAllPresence } from '../hooks/usePresence';
import './UserPeekModal.css';

const STALE_MS = 3 * 60_000;
const COLORS = ['var(--gold-2)', 'var(--live)', '#7ba4c4', '#c4907b', '#a47bc4', '#c4b87b'];
function avatarColor(uid = '') {
  let h = 0;
  for (const c of uid) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function UserPeekModal({ uid, name, onClose }) {
  const users = useAllUsers();
  const allPresence = useAllPresence();

  const user = uid ? users.find(u => u.uid === uid) : null;
  const presence = uid ? allPresence.find(p => p.uid === uid) : null;
  const online = presence && (Date.now() - (presence.lastSeen?.toMillis?.() ?? 0)) < STALE_MS;
  const displayName = user?.displayName || name || '?';
  const color = avatarColor(uid);

  return (
    <div className="modal-overlay upk-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="upk-box">
        <button className="upk-close btn icon ghost" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="upk-av" style={{ borderColor: color }}>
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt={displayName} />
            : <span>{displayName[0].toUpperCase()}</span>
          }
          {online && <span className="upk-dot" />}
        </div>

        <div className="upk-name">{displayName}</div>
        <div className="upk-role">{user?.role === 'dm' ? 'Dungeon Master' : 'Player'}</div>
        {online && <div className="upk-online">Online now</div>}
      </div>
    </div>
  );
}
