import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useActivity } from '../hooks/useActivity';
import { useTimeline } from '../hooks/useTimeline';
import { useCharacters } from '../hooks/useCharacters';
import { useLocations } from '../hooks/useLocations';
import { useQuests } from '../hooks/useQuests';
import './HomePage.css';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

function timeAgo(ts) {
  if (!ts?.toMillis) return '—';
  const diff = Date.now() - ts.toMillis();
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const HubTile = ({ icon, label, count, sub, dm, prep }) => (
  <div className={`tile${prep ? ' prep' : ''}${dm ? ' dm-only reveal-frame' : ''}`} style={dm ? { '--d': 'block' } : undefined}>
    <div className="ic">{icon}</div>
    <span className="n" style={prep ? { color: 'var(--blood-2)' } : undefined}>{count}</span>
    <h3>{label}</h3>
    <div className="sub" style={prep ? { color: '#c98a85' } : undefined}>{sub}</div>
  </div>
);

const FeedItem = ({ initials, dmAvatar, children, when, preview }) => (
  <div
    className={`item${dmAvatar ? ' dm-only reveal-frame' : ''}`}
    style={dmAvatar ? { '--d': 'flex' } : undefined}
  >
    <span className="av" style={{ width: 32, height: 32, fontSize: 12, ...(dmAvatar ? { borderColor: 'rgba(200,70,60,.5)' } : {}) }}>
      {initials}
    </span>
    <div>
      <div className="txt" style={dmAvatar ? { color: '#f0b3ad' } : undefined}>{children}</div>
      {preview && <div className="feed-preview">"{preview}"</div>}
      <div className="when">{when}</div>
    </div>
  </div>
);

const TYPE_ROUTE = { location: '/locations', character: '/characters', quest: '/quests' };

export default function HomePage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const { activity } = useActivity({ isDM, userId: user?.uid, max: 8 });
  const { entries: timelineEntries } = useTimeline(CAMPAIGN_ID, { isDM });
  const { mergedRoster } = useCharacters({ isDM });
  const { locations } = useLocations({ isDM });
  const { quests } = useQuests({ isDM, userId: user?.uid });

  const locCount  = locations.length;
  const charCount = mergedRoster.flatMap(g => g.items).length;
  const questCount = quests.length;

  const latestEntry = timelineEntries.find(e => !e.hidden) || null;

  return (
    <div className="app">
      <div className="scrim" onClick={onCloseNav} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

        <div className="main">
          <div className="topbar">
            <div className="row center gap-s">
              <button className="btn icon ghost hamburger" onClick={onToggleNav}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <span className="crumb">Campaign › <b>Home</b></span>
            </div>
            <div className="search" role="button" tabIndex={0}
              onClick={() => window.dispatchEvent(new Event('open-global-search'))}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.dispatchEvent(new Event('open-global-search')); }}
              style={{ cursor: 'text' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
              Search the tome…
              <span className="kbd">⌘K</span>
            </div>
            {profile?.role === 'dm' && (
              <div className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
                <span className={`toggle${isDM ? ' on' : ''}`} />
                DM Mode
              </div>
            )}
          </div>

          <div className="content">
            {/* hero */}
            <div className="hero">
              <div>
                <div className="eyebrow">The Land of Barovia</div>
                <h2>The mists do not lift.</h2>
                <div className="moon">734 · Waning of the Crow Moon</div>
              </div>
              <div className="stats">
                <div className="stat"><b>{timelineEntries.length || '—'}</b><span>Sessions</span></div>
                <div className="stat"><b>{charCount || '—'}</b><span>Souls</span></div>
                <div className="stat"><b>{questCount || '—'}</b><span>Quests</span></div>
              </div>
            </div>

            {/* left column */}
            <div>
              <div className="hub">
                <Link to='/locations'>
                  <HubTile
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>}
                    label="Locations" count={locCount || '—'} sub="Vallaki, Krezk & beyond"
                  />
                </Link>
                <Link to='/characters'>
                  <HubTile
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>}
                    label="Characters" count={charCount || '—'} sub="Allies & enemies"
                  />
                </Link>
                <HubTile
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l8-2 8 2v6c0 5-4 8-8 10-4-2-8-5-8-10z"/></svg>}
                  label="Factions" count={5} sub="Powers in the land"
                />
                <Link to="/quests">
                  <HubTile
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3v18l4-3 4 3V3z"/><path d="M13 3h6v15"/></svg>}
                    label="Quests" count={questCount || '—'} sub="Active & completed"
                  />
                </Link>
                <Link to="/loot">
                  <HubTile
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9h16v10H4z"/><path d="M4 9l2-4h12l2 4M12 9v10M9 13h6"/></svg>}
                    label="Loot" count={18} sub="1,204 gp pooled"
                  />
                </Link>
                <HubTile
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h11l3 3v13H5z"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>}
                  label="Lore" count={23} sub="Histories & omens"
                />
                {/* <HubTile
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 20l-4.9 2.2.9-5.5-4-3.9 5.5-.8z"/></svg>}
                  label="DM Prep" count={3} sub="Hidden from players"
                  dm prep
                /> */}
              </div>

              <div className="card standing">
                <div className="label">
                  <span className="eyebrow">Where things stand</span>
                  {latestEntry && <span className="chip gold">{latestEntry.session}</span>}
                </div>
                {latestEntry ? (
                  <p>
                    <span className="drop">{latestEntry.body[0]}</span>
                    {latestEntry.body.slice(1)}
                  </p>
                ) : (
                  <p className="muted" style={{ fontStyle: 'italic', fontSize: 14 }}>No sessions logged yet.</p>
                )}
                {isDM && latestEntry?.dmNote && (
                  <div className="prep-note dm-only reveal-frame" style={{ '--d': 'block' }}>
                    <div className="t"><b>⛓ DM only —</b> {latestEntry.dmNote}</div>
                  </div>
                )}
              </div>
            </div>

            {/* activity feed */}
            <div className="card feed">
              <div className="fh">
                <h3>Activity</h3>
                <span className="chip live"><span className="dot-live" /> Live</span>
              </div>
              {activity.length === 0 && (
                <div style={{ padding: '12px 0', color: 'var(--ink-3)', fontSize: 13 }}>
                  No activity yet. Notes added to characters, locations, and quests appear here.
                </div>
              )}
              {activity.map(n => (
                <FeedItem
                  key={n.id}
                  initials={(n.who || '?')[0].toUpperCase()}
                  dmAvatar={n.scope === 'dm'}
                  when={timeAgo(n.createdAt)}
                  preview={n.scope === 'pub' && n.body ? n.body.slice(0, 90) + (n.body.length > 90 ? '…' : '') : null}
                >
                  <b>{n.who}</b>{' '}
                  {n.scope === 'priv' && <span className="chip xs tag-priv">private</span>}
                  {n.scope === 'dm'   && <span className="chip xs tag-dm">DM</span>}
                  {' '}noted on{' '}
                  <Link to={TYPE_ROUTE[n.entityType] || '#'} style={{ color: 'var(--gold)' }}>
                    {n.entityName}
                  </Link>
                </FeedItem>
              ))}
              <Link to="/activity" className="seeall">View all activity →</Link>
            </div>
          </div>
        </div>
      </div>
  );
}
