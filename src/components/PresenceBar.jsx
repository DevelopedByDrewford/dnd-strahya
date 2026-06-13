import { usePresenceList } from '../hooks/usePresence';
import './PresenceBar.css';

const PRESENCE_COLORS = ['var(--gold-2)', 'var(--live)', '#7ba4c4', '#c4907b', '#a47bc4', '#c4b87b'];
function presenceColor(uid) {
  let h = 0;
  for (const c of uid) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return PRESENCE_COLORS[Math.abs(h) % PRESENCE_COLORS.length];
}

export default function PresenceBar({ userId, onOpen }) {
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
