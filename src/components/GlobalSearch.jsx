import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import { useLocations } from '../hooks/useLocations';
import { useQuests } from '../hooks/useQuests';
import { useTimeline } from '../hooks/useTimeline';
import { useLoot } from '../hooks/useLoot';
import './GlobalSearch.css';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

const PAGES = [
  { type: 'page', label: 'Home',         sub: 'Campaign overview',        to: '/',            icon: 'home' },
  { type: 'page', label: 'Timeline',     sub: 'Chronicle of Barovia',     to: '/timeline',    icon: 'timeline' },
  { type: 'page', label: 'Locations',    sub: 'Places in the world',      to: '/locations',   icon: 'location' },
  { type: 'page', label: 'Characters',   sub: 'Allies, enemies & more',   to: '/characters',  icon: 'character' },
  { type: 'page', label: 'Quests',       sub: 'Active & completed quests', to: '/quests',     icon: 'quest' },
  { type: 'page', label: 'Loot',         sub: 'Party treasure',           to: '/loot',        icon: 'loot' },
  { type: 'page', label: 'My Character', sub: 'Your character sheet',     to: '/my-character', icon: 'character' },
  { type: 'page', label: 'Activity',     sub: 'Recent notes & events',    to: '/activity',    icon: 'activity' },
];

const ALL_ACTIONS = [
  { type: 'action', label: 'New timeline entry', sub: 'Log a session moment',      to: '/timeline?new=true',   dmOnly: true,  icon: 'timeline' },
  { type: 'action', label: 'New location',       sub: 'Add a place to the world',  to: '/locations?new=true',  dmOnly: true,  icon: 'location' },
  { type: 'action', label: 'New character',      sub: 'Add an NPC or ally',        to: '/characters?new=true', dmOnly: true,  icon: 'character' },
  { type: 'action', label: 'New quest',          sub: 'Track a new quest',         to: '/quests?new=true',     dmOnly: false, icon: 'quest' },
  { type: 'action', label: 'New loot item',      sub: 'Add to the party pile',     to: '/loot?new=true',       dmOnly: false, icon: 'loot' },
  { type: 'action', label: 'Settings',           sub: 'Edit campaign settings',    event: 'open-settings',     dmOnly: true,  icon: 'settings' },
];

const ICONS = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>,
  home:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>,
  timeline:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18M4 7h4M4 12h4M4 17h4M16 7h4M16 12h4M16 17h4"/></svg>,
  location:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  character: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
  quest:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3v18l4-3 4 3V3z"/><path d="M13 3h6v15"/></svg>,
  loot:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9h16v10H4z"/><path d="M4 9l2-4h12l2 4M12 9v10M9 13h6"/></svg>,
  activity:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>,
  settings:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

function hit(text, q) {
  return typeof text === 'string' && text.toLowerCase().includes(q);
}

export default function GlobalSearch({ isDM, user, profile }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { mergedRoster } = useCharacters({ isDM });
  const { locations } = useLocations({ isDM });
  const { quests } = useQuests({ isDM, userId: user?.uid });
  const { entries } = useTimeline(CAMPAIGN_ID, { isDM });
  const { items: lootItems } = useLoot(CAMPAIGN_ID, { isDM, userId: user?.uid });

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    }
    function onOpen() { setOpen(true); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-global-search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-global-search', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    if (open) {
      setQuery('');
      setActiveIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }

    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            close();
        }
    }

    window.addEventListener('keydown', handleEsc);

    return () => {
        window.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  function close() {
    setOpen(false);
    setQuery('');
    setActiveIdx(0);
  }

  const sections = useMemo(() => {
    const q = query.toLowerCase().trim();
    const isNewKw = q === 'new' || q.startsWith('new ');
    const newSub = isNewKw ? q.replace(/^new\s*/, '') : '';
    const role = profile?.role || 'player';
    const results = [];

    const available = ALL_ACTIONS.filter(a => !a.dmOnly || role === 'dm');

    if (isNewKw) {
      // "new …" — actions only, no pages or data (they're noise here)
      const actionItems = newSub ? available.filter(a => hit(a.label, newSub)) : available;
      if (actionItems.length) results.push({ label: 'Actions', items: actionItems });
      return results;
    }

    // Normal order: pages → actions
    const pageItems = q ? PAGES.filter(p => hit(p.label, q) || hit(p.sub, q)) : PAGES;
    if (pageItems.length) results.push({ label: 'Pages', items: pageItems });

    const actionItems = q ? available.filter(a => hit(a.label, q)) : available;
    if (actionItems.length) results.push({ label: 'Actions', items: actionItems });

    if (!q) return results;

    // Characters
    const charItems = mergedRoster
      .flatMap(g => g.items)
      .filter(c => hit(c.n, q) || hit(c.r, q))
      .map(c => ({ type: 'character', label: c.n, sub: c.r || 'Character', to: `/characters?id=${c.id}`, icon: 'character' }));
    if (charItems.length) results.push({ label: 'Characters', items: charItems });

    // Locations
    const locItems = (locations || [])
      .filter(l => hit(l.name, q) || hit(l.locationType, q))
      .map(l => ({ type: 'location', label: l.name, sub: l.locationType || 'Location', to: `/locations?id=${l.id}`, icon: 'location' }));
    if (locItems.length) results.push({ label: 'Locations', items: locItems });

    // Quests
    const questItems = quests
      .filter(qt => hit(qt.name, q) || hit(qt.desc, q))
      .map(qt => ({ type: 'quest', label: qt.name, sub: qt.status === 'completed' ? 'Completed' : 'Active', to: `/quests?id=${qt.id}`, icon: 'quest' }));
    if (questItems.length) results.push({ label: 'Quests', items: questItems });

    // Loot
    const lootResults = (lootItems || [])
      .filter(l => hit(l.name, q) || hit(l.subtitle, q) || hit(l.foundAt, q))
      .map(l => ({ type: 'loot', label: l.name, sub: l.subtitle || l.foundAt || 'Loot item', to: '/loot', icon: 'loot' }));
    if (lootResults.length) results.push({ label: 'Loot', items: lootResults });

    // Timeline
    const tlItems = entries
      .filter(e => hit(e.title, q) || hit(e.session, q) || hit(e.body, q))
      .map(e => ({ type: 'timeline', label: e.title || e.session, sub: e.session, to: '/timeline', icon: 'timeline' }));
    if (tlItems.length) results.push({ label: 'Timeline', items: tlItems });

    return results;
  }, [query, mergedRoster, locations, quests, entries, lootItems, profile?.role]);

  const flatItems = useMemo(() => sections.flatMap(s => s.items), [sections]);

  function go(item) {
    close();
    if (item.event) {
      window.dispatchEvent(new Event(item.event));
    } else {
      navigate(item.to);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (flatItems[activeIdx]) go(flatItems[activeIdx]);
    } else if (e.key === 'Tab' && flatItems[activeIdx]) {
      e.preventDefault();
      setQuery(flatItems[activeIdx].label);
    }
  }

  if (!open) return null;

  let runIdx = 0;

  return (
    <div className="gs-overlay" onClick={close}>
      <div className="gs-box" role="dialog" aria-modal="true" aria-label="Search" onClick={e => e.stopPropagation()}>

        <div className="gs-input-row">
          <span className="gs-si">{ICONS.search}</span>
          <input
            ref={inputRef}
            className="gs-input"
            value={query}
            placeholder="Search the tome…"
            autoComplete="off"
            spellCheck={false}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="gs-clear" tabIndex={-1} onClick={() => { setQuery(''); inputRef.current?.focus(); }}>✕</button>
          )}
          <kbd className="gs-esc-key" onClick={close}>esc</kbd>
        </div>

        <div className="gs-body">
          {flatItems.length === 0 && query && (
            <div className="gs-empty">No results for &ldquo;{query}&rdquo;</div>
          )}
          {sections.map(section => (
            <div key={section.label} className="gs-section">
              <div className="gs-section-label">{section.label}</div>
              {section.items.map(item => {
                const myIdx = runIdx++;
                return (
                  <button
                    key={section.label + item.label + item.to}
                    className={`gs-item${myIdx === activeIdx ? ' active' : ''}`}
                    onClick={() => go(item)}
                    onMouseEnter={() => setActiveIdx(myIdx)}
                    tabIndex={-1}
                  >
                    <span className="gs-item-icon">{ICONS[item.icon] || ICONS.search}</span>
                    <span className="gs-item-text">
                      <span className="gs-item-label">{item.label}</span>
                      {item.sub && <span className="gs-item-sub">{item.sub}</span>}
                    </span>
                    <span className="gs-item-enter">↵</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {flatItems.length > 0 && (
          <div className="gs-footer">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> open</span>
            <span><kbd>tab</kbd> complete</span>
            <span><kbd>esc</kbd> close</span>
          </div>
        )}
      </div>
    </div>
  );
}
