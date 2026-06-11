import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import './HomePage.css';

const HubTile = ({ icon, label, count, sub, dm, prep }) => (
  <div className={`tile${prep ? ' prep' : ''}${dm ? ' dm-only reveal-frame' : ''}`} style={dm ? { '--d': 'block' } : undefined}>
    <div className="ic">{icon}</div>
    <span className="n" style={prep ? { color: 'var(--blood-2)' } : undefined}>{count}</span>
    <h3>{label}</h3>
    <div className="sub" style={prep ? { color: '#c98a85' } : undefined}>{sub}</div>
  </div>
);

const FeedItem = ({ initials, dmAvatar, children, when }) => (
  <div
    className={`item${dmAvatar ? ' dm-only reveal-frame' : ''}`}
    style={dmAvatar ? { '--d': 'flex' } : undefined}
  >
    <span className="av" style={{ width: 32, height: 32, fontSize: 12, ...(dmAvatar ? { borderColor: 'rgba(200,70,60,.5)' } : {}) }}>
      {initials}
    </span>
    <div>
      <div className="txt" style={dmAvatar ? { color: '#f0b3ad' } : undefined}>{children}</div>
      <div className="when">{when}</div>
    </div>
  </div>
);

export default function HomePage({ isDM, onToggleDM, onToggleNav, onCloseNav }) {
  return (
    <>
      <div className="scrim" onClick={onCloseNav} />
      <div className="app">
        <Sidebar isDM={isDM} onCloseNav={onCloseNav} />

        <div className="main">
          <div className="topbar">
            <div className="row center gap-s">
              <button className="btn icon ghost hamburger" onClick={onToggleNav}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <span className="crumb">Home › <b>Barovia</b></span>
            </div>
            <div className="search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
              Search the tome…
              <span className="kbd">⌘K</span>
            </div>
            <div className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
              <span className={`toggle${isDM ? ' on' : ''}`} />
              DM Mode
            </div>
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
                <div className="stat"><b>12</b><span>Sessions</span></div>
                <div className="stat"><b>47</b><span>Souls</span></div>
                <div className="stat"><b>6</b><span>Quests</span></div>
              </div>
            </div>

            {/* left column */}
            <div>
              <div className="hub">
                <Link to='/locations'>
                  <HubTile
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>}
                    label="Locations" count={9} sub="Vallaki, Krezk & beyond"
                  />
                </Link>
                <Link to='/characters'>
                  <HubTile
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>}
                    label="Characters" count={47} sub="Allies & enemies"
                  />
                </Link>
                <HubTile
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l8-2 8 2v6c0 5-4 8-8 10-4-2-8-5-8-10z"/></svg>}
                  label="Factions" count={5} sub="Powers in the land"
                />
                <Link to="/quests">
                  <HubTile
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3v18l4-3 4 3V3z"/><path d="M13 3h6v15"/></svg>}
                    label="Quests" count={6} sub="2 nearing deadline"
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
                <HubTile
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 20l-4.9 2.2.9-5.5-4-3.9 5.5-.8z"/></svg>}
                  label="DM Prep" count={3} sub="Hidden from players"
                  dm prep
                />
              </div>

              <div className="card standing">
                <div className="label">
                  <span className="eyebrow">Where things stand</span>
                  <span className="chip gold">Session 12</span>
                </div>
                <p>
                  <span className="drop">T</span>he party broke bread at the Blue Water Inn as Vallaki's festival drew near. Ireena's nerves fray with every nightfall, and the bargain with the Abbot of Krezk remains unmade — the soul coins still bound, the deadline closing.
                </p>
                <div className="prep-note dm-only reveal-frame" style={{ '--d': 'block' }}>
                  <div className="t"><b>⛓ DM only —</b> Next session: spring the ambush at the gates the moment they escort Ireena out. Foreshadow the Amber Temple.</div>
                </div>
              </div>
            </div>

            {/* activity feed */}
            <div className="card feed">
              <div className="fh">
                <h3>Activity</h3>
                <span className="chip live"><span className="dot-live" /> Live</span>
              </div>
              <FeedItem initials="G" when="2 minutes ago"><b>Greg</b> added a public note to <b>Strahd</b></FeedItem>
              <FeedItem initials="T" when="1 hour ago"><b>You</b> updated quest <b>Free the Soul Coins</b></FeedItem>
              <FeedItem initials="DM" dmAvatar when="just now · party notified"><b>You (DM)</b> revealed <b>Castle Ravenloft</b></FeedItem>
              <FeedItem initials="M" when="3 hours ago"><b>Marian</b> claimed <b>Potion of Healing ×2</b></FeedItem>
              <FeedItem initials="T" when="3 hours ago"><b>Tessa</b> joined the session</FeedItem>
              <Link to="/activity" className="seeall">View all activity →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
