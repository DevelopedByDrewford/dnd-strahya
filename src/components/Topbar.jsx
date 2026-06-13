import './Topbar.css';

export default function Topbar({ onToggleNav, isDM, onToggleDM, profile, crumb, leftExtra, rightExtra }) {
  const hasDM = profile?.role === 'dm';
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="btn icon ghost hamburger" onClick={onToggleNav}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        {leftExtra}
        {crumb && <span className="crumb">{crumb}</span>}
      </div>
      <div
        className="search" role="button" tabIndex={0}
        onClick={() => window.dispatchEvent(new Event('open-global-search'))}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.dispatchEvent(new Event('open-global-search')); }}
        style={{ cursor: 'text' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>
        </svg>
        Search the tome…
        <span className="kbd">⌘K</span>
      </div>
      <div className="topbar-right">
        {rightExtra}
        <button
          className="btn icon ghost search-icon-mobile"
          onClick={() => window.dispatchEvent(new Event('open-global-search'))}
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>
          </svg>
        </button>
        {hasDM && (
          <button className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
            <span className={`toggle${isDM ? ' on' : ''}`} />
            DM Mode
          </button>
        )}
      </div>
    </div>
  );
}
