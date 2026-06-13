import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import QuestModal from '../components/QuestModal';
import NotesList from '../components/NotesList';
import { QI } from '../data/quests';
import { useQuests } from '../hooks/useQuests';
import { useCharacters } from '../hooks/useCharacters';
import { useLocations } from '../hooks/useLocations';
import './QuestsPage.css';
import { lang } from '../data/lang';


const QLIST_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h10M4 18h7"/></svg>';
const PLUS_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';

const FILTERS = ['Active', 'Completed', 'All', 'Mine'];

function pct(q) {
  if (!q.subs.length) return 0;
  return Math.round(q.subs.filter(s => s.done).length / q.subs.length * 100);
}

function QuestList({ quests, selectedId, onSelect, filter, onFilter, isDM, onNew, onSeed, seeding, seeded, loading, user }) {
  const visible = quests.filter(q => {
    if (q.dm && !isDM) return false;
    if (filter === 'Active')    return q.status === 'active';
    if (filter === 'Completed') return q.status === 'completed';
    if (filter === 'Mine')      return q.byYou;
    return true;
  });

  return (
    <aside className="qlist">
      <div className="qlhead">
        <h2>Quests</h2>
        {user && seeded && <button className="btn sm" onClick={onNew} dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' New' }} />}
      </div>
      {!loading && !seeded && isDM && (
        <div style={{ padding: '16px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>No quests yet.</p>
          <button className="btn sm primary" onClick={onSeed} disabled={seeding}>
            {seeding ? 'Seeding…' : 'Import sample data'}
          </button>
        </div>
      )}
      <div className="qfilters">
        {FILTERS.map(f => (
          <button key={f} className={`qfilter${filter === f ? ' on' : ''}`} onClick={() => onFilter(f)}>{f}</button>
        ))}
      </div>
      <div>
        {visible.map(q => (
          <div
            key={q.id}
            className={`qcard${q.status === 'completed' ? ' done' : ''}${selectedId === q.id ? ' sel' : ''}${q.dm ? ' dm-only qcard-hidden' : ''}`}
            style={q.dm ? { '--d': 'block' } : undefined}
            onClick={() => onSelect(q.id)}
          >
            <div className="qt">
              <span className="qi" dangerouslySetInnerHTML={{ __html: QI.quest }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="qnm">{q.name}</div>
                <div className="qmeta">
                  {q.byYou
                    ? <span className="chip sm" style={{ color: 'var(--live)', borderColor: 'rgba(127,160,95,.4)' }}>you</span>
                    : q.by === 'DM'
                      ? <span className="chip sm tag-dm">DM</span>
                      : <span className="chip sm">{q.by}</span>
                  }
                  {q.dm && <span className="chip sm tag-dm">⛓ Hidden</span>}
                </div>
              </div>
            </div>
            <div className="qbar"><span style={{ width: `${pct(q)}%` }} /></div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function QuestDetail({ quest, isDM, onToggleSub, onAddSub, onEdit, onDelete, user, profile }) {
  const [addingObj, setAddingObj] = useState(false);
  const [newObj, setNewObj] = useState('');

  if (!quest) return <div className="qdetail"><p className="muted">Select a quest.</p></div>;

  function submitNewObj() {
    const text = newObj.trim();
    if (!text) return;
    onAddSub(quest.id, text);
    setNewObj('');
    setAddingObj(false);
  }

  const doneCount = quest.subs.filter(s => s.done).length;
  const failCount = quest.subs.filter(s => s.failed).length;

  const statusChip = quest.status === 'completed'
    ? <span className="chip sm" style={{ color: 'var(--live)', borderColor: 'rgba(127,160,95,.4)', background: 'rgba(127,160,95,.1)' }}>✓ Completed</span>
    : <span className="chip gold sm">Active</span>;


  const visChip = quest.dm
    ? <span className="chip sm tag-dm dm-only" style={{ '--d': 'inline-flex' }}>⛓ Hidden quest</span>
    : <span className="chip sm">Added by {quest.byYou ? 'you' : quest.by}</span>;

  return (
    <div className="qdetail">
      <div className="qhero">
        <div className="eyebrow">{quest.location} · Quest</div>
        <h1>{quest.name}</h1>
        <div className="qchips">
          {statusChip}
          {visChip}
          <span style={{ flex: 1 }} />
          {quest.firestore && user && (
            <>
              <button className="btn sm" onClick={onEdit}>✎ Edit</button>
              <button className="btn sm ghost" onClick={onDelete} style={{ color: 'var(--blood)' }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="qbody">
        <div>
          {/* Description */}
          <div className="q-sec">
            <p className="q-prose">{quest.desc}</p>
          </div>

          {/* Objectives */}
          <div className="q-sec">
            <h3>
              Objectives
              <span className="count-label">
                {doneCount}/{quest.subs.length} done
                {failCount > 0 && <span className="count-fail"> · {failCount} failed</span>}
              </span>
            </h3>
            {quest.subs.length > 0 && (
              <div className="checklist-head">
                <span className="ch-done">Completed</span>
                <span style={{ flex: 1 }} />
                <span className="ch-fail">Failed</span>
              </div>
            )}
            <div className="checklist">
              {quest.subs.map((s, i) => (
                <div
                  key={i}
                  className={`q-check${s.done ? ' on' : ''}${s.failed ? ' fail' : ''}`}
                  onClick={() => onToggleSub(quest.id, i, 'done')}
                >
                  <span className="q-box" dangerouslySetInnerHTML={{ __html: QI.check }} />
                  <span className="ct">{s.t}</span>
                  <span
                    className="q-fail-box"
                    dangerouslySetInnerHTML={{ __html: QI.x }}
                    onClick={e => { e.stopPropagation(); onToggleSub(quest.id, i, 'failed'); }}
                  />
                </div>
              ))}
              {user && quest.firestore && (
                addingObj ? (
                  <div className="addsub addsub-active">
                    <span className="q-box" style={{ borderStyle: 'dashed' }} />
                    <input
                      className="addsub-field"
                      autoFocus
                      placeholder="New objective…"
                      value={newObj}
                      onChange={e => setNewObj(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); submitNewObj(); }
                        if (e.key === 'Escape') { setAddingObj(false); setNewObj(''); }
                      }}
                    />
                    <button className="btn sm" onClick={submitNewObj} disabled={!newObj.trim()}>Add</button>
                    <button className="btn sm ghost" onClick={() => { setAddingObj(false); setNewObj(''); }}>✕</button>
                  </div>
                ) : (
                  <div className="addsub" onClick={() => setAddingObj(true)}>
                    <span className="q-box" style={{ borderStyle: 'dashed' }} />
                    Add an objective…
                  </div>
                )
              )}
            </div>
          </div>

          {/* DM Secret */}
          {quest.secret && (
            <div className="q-sec dm-only reveal-frame" style={{ '--d': 'block' }}>
              <div className="q-secret">
                <h3>⛓ DM — Secret Objective &amp; Notes</h3>
                <p className="q-prose">{quest.secret}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="q-sec quest-notes-section">
            <NotesList
              entityId={quest.id}
              entityType="quest"
              entityName={quest.name}
              user={user}
              profile={profile}
              isDM={isDM}
            />
          </div>
        </div>

        {/* Right side rail */}
        <aside className="qside">
          <div className="scard">
            <div className="sk">Quest Giver</div>
            <div className="linkrow">
              <span className="av" style={{ width: 32, height: 32, fontSize: 12 }}>
                {quest.giver[0]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {quest.giverId
                  ? <Link to={`/characters?id=${quest.giverId}`} className="nm lnk">{quest.giver}</Link>
                  : <div className="nm">{quest.giver}</div>
                }
                <div className="ty">{quest.location}</div>
              </div>
            </div>
          </div>

          <div className="scard">
            <div className="sk">Rewards</div>
            {quest.rewards.map((r, i) => (
              <div key={i} className="reward">
                <span className="ri" dangerouslySetInnerHTML={{ __html: QI.coin }} />
                {r}
              </div>
            ))}
          </div>

          {quest.links.length > 0 && (
            <div className="scard">
              <div className="sk">Linked Records</div>
              {quest.links.map((l, i) => {
                const href = l.id
                  ? (l.kind === 'location' ? `/locations?id=${l.id}` : l.kind === 'quest' ? `/quests?id=${l.id}` : `/characters?id=${l.id}`)
                  : null;
                return (
                  <div key={i} className="linkrow">
                    <span className="av" style={{ width: 30, height: 30, fontSize: 12 }}
                      dangerouslySetInnerHTML={{ __html: l.kind === 'location' ? QI.pin : QI.user }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {href
                        ? <Link to={href} className="nm lnk">{l.name}</Link>
                        : <div className="nm">{l.name}</div>
                      }
                      {l.label && <div className="ty">{l.label}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}


export default function QuestsPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { quests, loading, seeded, addQuest, updateQuest, deleteQuest, seedQuests } = useQuests({ userId: user?.uid, isDM });
  const { mergedRoster } = useCharacters({ isDM });
  const { locations } = useLocations({ isDM });
  const allChars = mergedRoster.flatMap(g => g.items);
  const [seeding, setSeeding] = useState(false);
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || 'soul-coins');
  const [filter, setFilter]         = useState('Active');
  const [qlistOpen, setQlistOpen]   = useState(false);
  const [modal, setModal]           = useState(searchParams.get('new') === 'true' ? { mode: 'create' } : null);

  useEffect(() => {
    if (searchParams.get('new') !== 'true') return;
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('new'); return n; }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  useEffect(() => {
    document.body.classList.toggle('qlist-open', qlistOpen);
    return () => document.body.classList.remove('qlist-open');
  }, [qlistOpen]);

  async function handleSeed() {
    setSeeding(true);
    try { await seedQuests(); } finally { setSeeding(false); }
  }

  function selectQuest(id) {
    setSelectedId(id);
    setSearchParams({ id }, { replace: true });
    setQlistOpen(false);
  }

  async function toggleSub(questId, subIndex, field = 'done') {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;
    const newSubs = quest.subs.map((s, i) => i === subIndex ? { ...s, [field]: !s[field] } : s);
    if (quest.firestore) {
      await updateQuest(questId, { subs: newSubs });
    }
  }

  async function addSub(questId, text) {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.firestore) return;
    await updateQuest(questId, { subs: [...quest.subs, { t: text, done: false }] });
  }

  function closeAll() {
    onCloseNav();
    setQlistOpen(false);
  }

  async function handleSave(data) {
    if (modal.mode === 'create') {
      const ref = await addQuest(data);
      selectQuest(ref.id);
    } else {
      await updateQuest(modal.quest.id, data);
    }
  }

  async function handleDelete() {
    const quest = quests.find(q => q.id === selectedId);
    if (!quest) return;
    if (!window.confirm(`Delete "${quest.name}"? This cannot be undone.`)) return;
    selectQuest('soul-coins');
    await deleteQuest(selectedId);
  }

  const selectedQuest = quests.find(q => q.id === selectedId) || null;

  return (
    <div className="q-app">
      <div className="scrim" onClick={closeAll} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

      <div className="q-main">
        <Topbar
          onToggleNav={onToggleNav}
          isDM={isDM}
          onToggleDM={onToggleDM}
          profile={profile}
          leftExtra={
            <button className="qlistToggle" onClick={() => setQlistOpen(o => !o)}
              dangerouslySetInnerHTML={{ __html: QLIST_SVG }} />
          }
          crumb={<>{lang.breadcrumb_world} › <b>Quest</b></>}
        />

        <div className="qlayout">
          <QuestList
            quests={quests}
            selectedId={selectedId}
            onSelect={selectQuest}
            filter={filter}
            onFilter={setFilter}
            isDM={isDM}
            onNew={() => setModal({ mode: 'create' })}
            onSeed={handleSeed}
            seeding={seeding}
            seeded={seeded}
            loading={loading}
            user={user}
          />
          <QuestDetail
            quest={selectedQuest}
            isDM={isDM}
            onToggleSub={toggleSub}
            onAddSub={addSub}
            onEdit={() => setModal({ mode: 'edit', quest: selectedQuest })}
            onDelete={handleDelete}
            user={user}
            profile={profile}
          />
        </div>
      </div>

      {modal && (
        <QuestModal
          initial={modal.mode === 'edit' ? modal.quest : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
          characters={allChars}
          locations={locations}
          isDM={isDM}
        />
      )}
    </div>
  );
}
