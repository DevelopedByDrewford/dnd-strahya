import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import LocationModal from '../components/LocationModal';
import NotesList from '../components/NotesList';
import { ICONS } from '../data/locations';
import { useLocations } from '../hooks/useLocations';
import ImageLightbox from '../components/ImageLightbox';
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
function LocationDetail({ loc, isDM, onSelect, onEdit, onDelete, user, profile, onImageClick }) {

  const visChip = loc.visibility === 'hidden'
    ? <span className="chip sm tag-dm dm-only" style={{ '--d': 'inline-flex' }}>⛓ Hidden record</span>
    : <span className="chip sm tag-pub dm-only" style={{ '--d': 'inline-flex' }}>👁 Visible to players</span>;

  return (
    <>
      {/* Banner */}
      <div className="banner">
        {loc.imageUrl
          ? <img className="banner-img" src={loc.imageUrl} alt={loc.name} onClick={() => onImageClick(loc.imageUrl)} style={{ cursor: 'zoom-in' }} />
          : <div className="banner-hint">{loc.img}</div>
        }
        <div className="banner-frame" />
        <div className="banner-label">
          <div>
            <div className="eyebrow">{loc.region}</div>
            <h1>{loc.name}</h1>
          </div>
          {isDM && loc.firestore && (
            <div className="row gap-s dm-only" style={{ '--d': 'flex' }}>
              <button className="btn sm" onClick={onEdit}>Edit</button>
              <button className="btn sm blood" onClick={onDelete}>Delete</button>
            </div>
          )}
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
          {loc.secret && (
            <div className="sec dm-only reveal-frame" style={{ '--d': 'block' }}>
              <div className="field-secret">
                <div className="sec-head">
                  <h3 style={{ color: '#f0b3ad' }}>⛓ Secrets & DM Notes</h3>
                  <span className="chip sm tag-dm">DM only field</span>
                </div>
                <div className="prose">{loc.secret}</div>
              </div>
            </div>
          )}

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
          {loc.people.length > 0 && (
            <div className="sec">
              <div className="sec-head"><h3>Who is here</h3></div>
              <div className="people">
                {loc.people.map((p, i) => <PersonCard key={i} person={p} />)}
              </div>
            </div>
          )}

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
          <NotesList
            entityId={loc.id}
            entityType="location"
            entityName={loc.name}
            user={user}
            profile={profile}
            isDM={isDM}
          />
        </aside>
      </div>
    </>
  );
}

// ---- Main page ----
export default function LocationsPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || 'blue-water-inn');
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [treeOpen, setTreeOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === 'true');

  const { mergedTree, getLoc, loading, seeded, addLocation, updateLocation, deleteLocation, seedLocations } = useLocations({ isDM });
  const [seeding, setSeeding] = useState(false);
  const [editModal, setEditModal] = useState(null); // null | { id, loc }
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (searchParams.get('new') !== 'true') return;
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('new'); return n; }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  async function handleSeed() {
    setSeeding(true);
    try { await seedLocations(); } finally { setSeeding(false); }
  }

  function openEdit() {
    const loc = getLoc(selectedId);
    setEditModal({ id: selectedId, loc });
  }

  async function handleEditSave(data) {
    await updateLocation(editModal.id, data);
  }

  async function handleDelete() {
    const loc = getLoc(selectedId);
    if (!window.confirm(`Delete "${loc.name}"? This cannot be undone.`)) return;
    const idToDelete = selectedId;
    selectLocation('blue-water-inn');
    await deleteLocation(idToDelete);
  }

  useEffect(() => {
    document.body.classList.toggle('tree-open', treeOpen);
    return () => document.body.classList.remove('tree-open');
  }, [treeOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedId]);

  const selectLocation = (id) => {
    setSelectedId(id);
    setSearchParams({ id }, { replace: true });
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
          <Topbar
            onToggleNav={onToggleNav}
            isDM={isDM}
            onToggleDM={onToggleDM}
            profile={profile}
            leftExtra={
              <button className="btn icon ghost treeToggle" onClick={() => setTreeOpen(o => !o)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h10M4 18h7"/></svg>
              </button>
            }
            crumb={<><Link to="/locations">Locations</Link><span className="sep">›</span>{crumb}</>}
          />

          <div className="loc-layout">
            {/* Tree panel */}
            <aside className="tree" id="tree">
              <div className="tree-head">
                <h2>Locations</h2>
                {isDM && (
                  <button
                    className="btn sm dm-only"
                    style={{ '--d': 'inline-flex' }}
                    onClick={() => setModalOpen(true)}
                  >
                    + New
                  </button>
                )}
              </div>
              {!loading && !seeded && isDM && (
                <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>No locations yet.</p>
                  <button className="btn sm primary" onClick={handleSeed} disabled={seeding}>
                    {seeding ? 'Seeding…' : 'Import sample data'}
                  </button>
                </div>
              )}
              {mergedTree.map(node => (
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
              <LocationDetail key={selectedId} loc={loc} isDM={isDM} onSelect={selectLocation} onEdit={openEdit} onDelete={handleDelete} user={user} profile={profile} onImageClick={setLightbox} />
            </section>
          </div>
        </div>

      {modalOpen && (
        <LocationModal
          onSave={addLocation}
          onClose={() => setModalOpen(false)}
        />
      )}
      {editModal && (
        <LocationModal
          initial={editModal.loc}
          onSave={handleEditSave}
          onClose={() => setEditModal(null)}
        />
      )}
      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
