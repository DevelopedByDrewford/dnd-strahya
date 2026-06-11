import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_GROUPS = [
  {
    group: 'Campaign',
    items: [
      { to: '/', label: 'Home', end: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg> },
      { label: 'Timeline', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18M4 7h4M4 12h4M4 17h4M16 7h4M16 12h4M16 17h4"/></svg> },
    ],
  },
  {
    group: 'The World',
    items: [
      { to: '/locations', label: 'Locations', count: 9, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> },
      { label: 'Characters', count: 47, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg> },
      { label: 'Quests', count: 6, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3v18l4-3 4 3V3z"/><path d="M13 3h6v15"/></svg> },
      { label: 'Loot', count: 18, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9h16v10H4z"/><path d="M4 9l2-4h12l2 4M12 9v10M9 13h6"/></svg> },
    ],
  },
  {
    group: 'You',
    items: [
      { label: 'My Character', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l2 5h5l-4 4 1.5 6L12 20 7.5 22 9 16 5 12h5z"/></svg> },
      { label: 'My Notes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h11l3 3v13H5z"/><path d="M9 9h6M9 13h6M9 17h3"/></svg> },
    ],
  },
];

export default function Sidebar({ isDM, onCloseNav }) {
  return (
    <nav className="rail" id="rail">
      <div className="brand">
        <span className="sigil">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-2)" strokeWidth="1.4">
            <path d="M5 3h11l3 3v15H5z"/><path d="M16 3v3h3"/><path d="M8 9h7M8 12h7M8 15h5"/>
          </svg>
        </span>
        <div>
          <h1>The Tome</h1>
          <small>Curse of Strahd</small>
        </div>
      </div>

      {NAV_GROUPS.map(({ group, items }) => (
        <div key={group}>
          <div className="grp">{group}</div>
          {items.map(({ to, end, label, count, icon }) =>
            to ? (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={({ isActive }) => `nav${isActive ? ' active' : ''}`}
                onClick={onCloseNav}
              >
                {icon}
                {label}
                {count != null && <span className="count">{count}</span>}
              </NavLink>
            ) : (
              <div key={label} className="nav">
                {icon}
                {label}
                {count != null && <span className="count">{count}</span>}
              </div>
            )
          )}
        </div>
      ))}

      <div className="grp dm-only" style={{ '--d': 'block' }}>Admin · DM</div>
      <div className="nav dm-only" style={{ '--d': 'flex' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
        Create / Edit
      </div>

      <div className="me">
        <span className="av" style={{ width: 34, height: 34, fontSize: 13 }}>T</span>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Tessa</div>
          <div className="tiny dim">{isDM ? 'Dungeon Master' : 'Player'}</div>
        </div>
      </div>
    </nav>
  );
}
