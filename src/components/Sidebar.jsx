import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import './Sidebar.css';

const NAV_GROUPS = [
  {
    group: 'Campaign',
    items: [
      { to: '/', label: 'Home', end: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg> },
      { to: '/timeline', label: 'Timeline', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18M4 7h4M4 12h4M4 17h4M16 7h4M16 12h4M16 17h4"/></svg> },
    ],
  },
  {
    group: 'The World',
    items: [
      { to: '/locations', label: 'Locations', count: 9, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> },
      { to: '/characters', label: 'Characters', count: 47, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg> },
      { to: '/quests', label: 'Quests', count: 6, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3v18l4-3 4 3V3z"/><path d="M13 3h6v15"/></svg> },
      { to: '/loot', label: 'Loot', count: 18, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9h16v10H4z"/><path d="M4 9l2-4h12l2 4M12 9v10M9 13h6"/></svg> },
    ],
  },
  {
    group: 'You',
    items: [
      { to: '/my-character', label: 'My Character', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l2 5h5l-4 4 1.5 6L12 20 7.5 22 9 16 5 12h5z"/></svg> },
      { to: '/my-notes', label: 'My Notes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h11l3 3v13H5z"/><path d="M9 9h6M9 13h6M9 17h3"/></svg> },
    ],
  },
];

export default function Sidebar({ isDM, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
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

        <div className={`me${user ? ' me-clickable' : ''}`} onClick={user ? () => setShowProfile(true) : undefined}>
          {user === undefined ? null : user === null ? (
            <button className="btn ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onSignIn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In
            </button>
          ) : (
            <>
              {profile?.avatarUrl ? (
                <img className="av" src={profile.avatarUrl} alt="" style={{ width: 34, height: 34 }} />
              ) : (
                <span className="av" style={{ width: 34, height: 34, fontSize: 13 }}>
                  {(profile?.displayName ?? user.email)[0].toUpperCase()}
                </span>
              )}
              <div style={{ lineHeight: 1.15, flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.displayName ?? user.email}
                </div>
                <div className="tiny dim">{profile?.role === 'dm' ? 'Dungeon Master' : 'Player'}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="me-chevron">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            </>
          )}
        </div>
      </nav>

      {showProfile && (
        <ProfileModal
          user={user}
          profile={profile}
          onClose={() => setShowProfile(false)}
          onSignOut={onSignOut}
          onProfileUpdate={onProfileUpdate}
        />
      )}
    </>
  );
}
