import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { TREE, ICONS, getLoc } from '../data/locations';
import './LocationsPage.css';

// ---- icon helpers ----
function Icon({ type, className }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: ICONS[type] || ICONS.pin }} />;
}

// ---- Tree node (recursive) ----
function TreeNode({ node, selectedId, collapsedIds, onSelect, onToggle }) {
  const hasKids = node.children?.length > 0;
  const isCollapsed = collapsedIds.has(node.id);
  const isOpen = hasKids && !isCollapsed;

  return (
    <div
      className={`tnode${node.dm ? ' dm-only' : ''}`}
      style={node.dm ? { '--d': 'block' } : undefined}
    >
      <button
        className={`trow${isOpen ? ' open' : ''}${node.dm ? ' dmrow dm-only' : ''}${selectedId === node.id ? ' sel' : ''}`}
        style={node.dm ? { '--d': 'flex' } : undefined}
        onClick={(e) => {
          if (hasKids && e.target.closest('.tw')) {
            onToggle(node.id);
          } else {
            onSelect(node.id);
          }
        }}
      >
        {hasKids
          ? <span className="tw">▶</span>
          : <Icon type={node.type} className="tpin" />
        }
        <span className="tlbl">{node.name}</span>
        {node.dm && <span className="tbadge">⛓</span>}
      </button>

      {hasKids && (
        <div className={`tchildren${isCollapsed ? ' collapsed' : ''}`} data-parent={node.id}>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              collapsedIds={collapsedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Sub-location card ----
function SubCard({ sub, onSelect }) {
  return (
    <button
      className={`subcard${sub.dm ? ' dm-only reveal-frame' : ''}`}
      style={sub.dm ? { '--d': 'block' } : undefined}
      onClick={() => onSelect(sub.id)}
    >
      <div className="subcard-ic" dangerouslySetInnerHTML={{ __html: ICONS[sub.ic] || ICONS.door }} />
      <h4>{sub.n}</h4>
      <div className="subcard-d">{sub.d}</div>
    </button>
  );
}

// ---- Person card ----
function PersonCard({ person }) {
  return (
    <button
      className={`pc${person.dm ? ' dm-only reveal-frame' : ''}`}
      style={person.dm ? { '--d': 'flex' } : undefined}
    >
      <span className="av" style={{ width: 34, height: 34, fontSize: 12 }}>{person.n[0]}</span>
      <div>
        <div className="pc-name">{person.n}</div>
        <div className="pc-role">{person.r}</div>
      </div>
    </button>
  );
}

// ---- Location detail ----
function LocationDetail({ loc, onSelect }) {
  const [noteFilter, setNoteFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pub', label: 'Public' },
    { key: 'mine', label: 'Mine' },
    { key: 'dm', label: 'DM', dmOnly: true },
  ];

  const noteMap = { pub: 'pub', priv: 'priv', dm: 'dmn' };
  const tagMap = {
    pub: ['tag-pub', 'Public'],
    priv: ['tag-priv', 'Private'],
    dm: ['tag-dm', 'DM only'],
  };

  const visibleNotes = loc.notes.filter(n => {
    if (noteFilter === 'all') return true;
    if (noteFilter === 'pub') return n.scope === 'pub';
    if (noteFilter === 'mine') return n.scope === 'priv';
    if (noteFilter === 'dm') return n.scope === 'dm';
    return true;
  });

  const noteCount = loc.notes.length;

  const visChip = loc.visibility === 'hidden'
    ? <span className="chip sm tag-dm dm-only" style={{ '--d': 'inline-flex' }}>⛓ Hidden record</span>
    : <span className="chip sm tag-pub dm-only" style={{ '--d': 'inline-flex' }}>👁 Visible to players</span>;

  return (
    <>
      {/* Banner */}
      <div className="banner">
        <div className="banner-frame" />
        <div className="banner-hint">{loc.img}</div>
        <div className="banner-actions dm-only" style={{ '--d': 'block' }}>
          <button className="btn sm">Replace image</button>
        </div>
        <div className="banner-label">
          <div>
            <div className="eyebrow">{loc.region}</div>
            <h1>{loc.name}</h1>
          </div>
          <div className="row gap-s dm-only" style={{ '--d': 'flex' }}>
            <button className="btn sm">Edit</button>
            <button className="btn sm blood">Reveal…</button>
          </div>
        </div>
      </div>

      <div className="dbody">
        {/* left main column */}
        <div className="dmain">
          <div className="meta-chips">
            <span className="chip sm gold">{loc.type}</span>
            {loc.tags.map(t => <span key={t} className="chip sm">{t}</span>)}
            {visChip}
          </div>

          {/* Description */}
          <div className="sec">
            <div className="sec-head">
              <h3>Description</h3>
              <span className="chip sm tag-pub dm-only" style={{ '--d': 'inline-flex' }}>👁 public field</span>
            </div>
            <div className="prose">
              {loc.desc.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          {/* Secrets — DM only */}
          <div className="sec dm-only reveal-frame" style={{ '--d': 'block' }}>
            <div className="field-secret">
              <div className="sec-head">
                <h3 style={{ color: '#f0b3ad' }}>⛓ Secrets & DM Notes</h3>
                <span className="chip sm tag-dm">DM only field</span>
              </div>
              <div className="prose">{loc.secret}</div>
            </div>
          </div>

          {/* Sub-locations */}
          {loc.subs.length > 0 && (
            <div className="sec">
              <div className="sec-head">
                <h3>Within this place</h3>
                <button className="btn sm dm-only" style={{ '--d': 'inline-flex' }}>+ Add</button>
              </div>
              <div className="subs">
                {loc.subs.map(s => <SubCard key={s.id} sub={s} onSelect={onSelect} />)}
              </div>
            </div>
          )}

          {/* Who is here */}
          <div className="sec">
            <div className="sec-head"><h3>Who is here</h3></div>
            <div className="people">
              {loc.people.map((p, i) => <PersonCard key={i} person={p} />)}
            </div>
          </div>

          {/* Quests */}
          <div className="sec">
            <div className="sec-head"><h3>Quests</h3></div>
            {loc.quests.length > 0
              ? loc.quests.map((q, i) => (
                <div key={i} className="qrow">
                  <div className="qrow-ic" dangerouslySetInnerHTML={{ __html: ICONS.quest }} />
                  <div className="grow">
                    <div className="qrow-name">{q.n}</div>
                    <div className="qrow-meta">{q.m}</div>
                  </div>
                  <span className="chip sm gold">Active</span>
                </div>
              ))
              : <div className="no-quests">No quests tied to this place.</div>
            }
          </div>
        </div>

        {/* Notes rail */}
        <aside className="notes">
          <div className="notes-head">
            <h3>Notes</h3>
            <span className="chip sm"><span className="dot-live" /> {noteCount} here</span>
          </div>
          <div className="nfilters">
            {filters.map(f => (
              <button
                key={f.key}
                className={`nfilter${noteFilter === f.key ? ' on' : ''}${f.dmOnly ? ' dm-only' : ''}`}
                style={f.dmOnly ? { '--d': 'inline' } : undefined}
                onClick={() => setNoteFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {visibleNotes.map((n, i) => {
            const [tagCls, tagLabel] = tagMap[n.scope];
            return (
              <div key={i} className={`note ${noteMap[n.scope]}`}>
                <div className="note-head">
                  <span className={`chip sm ${tagCls}`}>{tagLabel} · {n.who}</span>
                  <span className="tiny dim">{n.when}</span>
                </div>
                <div className="note-body">{n.body}</div>
              </div>
            );
          })}
          <button className="btn blood nadd">+ Add a note</button>
        </aside>
      </div>
    </>
  );
}

// ---- Main page ----
export default function LocationsPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [selectedId, setSelectedId] = useState('blue-water-inn');
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [treeOpen, setTreeOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('tree-open', treeOpen);
    return () => document.body.classList.remove('tree-open');
  }, [treeOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedId]);

  const selectLocation = (id) => {
    setSelectedId(id);
    if (window.innerWidth <= 900) setTreeOpen(false);
  };

  const toggleNode = (id) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const closeAll = () => {
    onCloseNav();
    setTreeOpen(false);
  };

  const loc = getLoc(selectedId);

  const crumb = loc.parentId
    ? <>
        <button onClick={() => selectLocation(loc.parentId)}>{loc.parent}</button>
        <span className="sep">›</span>
        <b>{loc.name}</b>
      </>
    : <b>{loc.name}</b>;

  return (
    <div className="app">
      <div className="scrim" onClick={closeAll} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

        <div className="main">
          <div className="loc-topbar">
            <button className="btn icon ghost hamburger" onClick={onToggleNav}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="loc-crumb">
              <button className="btn icon ghost treeToggle" onClick={() => setTreeOpen(o => !o)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h10M4 18h7"/></svg>
              </button>
              <Link to="/locations" className="loc-crumb-link">Locations</Link>
              <span className="sep">›</span>
              {crumb}
            </div>
            <div className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
              <span className={`toggle${isDM ? ' on' : ''}`} />
              DM Mode
            </div>
          </div>

          <div className="loc-layout">
            {/* Tree panel */}
            <aside className="tree" id="tree">
              <div className="tree-head">
                <h2>Locations</h2>
                <button className="btn sm dm-only" style={{ '--d': 'inline-flex' }}>+ New</button>
              </div>
              {TREE.map(node => (
                <TreeNode
                  key={node.id}
                  node={node}
                  selectedId={selectedId}
                  collapsedIds={collapsedIds}
                  onSelect={selectLocation}
                  onToggle={toggleNode}
                />
              ))}
            </aside>

            {/* Detail panel */}
            <section className="detail">
              <LocationDetail key={selectedId} loc={loc} onSelect={selectLocation} />
            </section>
          </div>
        </div>
      </div>
  );
}
