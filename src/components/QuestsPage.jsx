import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { QI, QUESTS_INITIAL, LOOT } from '../data/quests';
import './QuestsPage.css';

const MENU_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
const QLIST_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h10M4 18h7"/></svg>';
const PLUS_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';

const FILTERS = ['Active', 'Completed', 'All', 'Mine'];

function pct(q) {
  if (!q.subs.length) return 0;
  return Math.round(q.subs.filter(s => s.done).length / q.subs.length * 100);
}

function QuestList({ quests, selectedId, onSelect, filter, onFilter, isDM }) {
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
        <button className="btn sm" dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' New' }} />
      </div>
      <div className="qfilters">
        {FILTERS.map(f => (
          <button key={f} className={`qfilter${filter === f ? ' on' : ''}`} onClick={() => onFilter(f)}>{f}</button>
        ))}
      </div>
      <div>
        {visible.map(q => (
          <div
            key={q.id}
            className={`qcard${q.status === 'completed' ? ' done' : ''}${selectedId === q.id ? ' sel' : ''}${q.dm ? ' dm-only' : ''}`}
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
                      ? <span className="chip sm tag-dm dm-only" style={{ '--d': 'inline-flex' }}>DM</span>
                      : <span className="chip sm">{q.by}</span>
                  }
                  {q.deadline && (
                    <span className={`deadline${q.deadlineState ? ' ' + q.deadlineState : ''}`}>⏱ {q.deadline}</span>
                  )}
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

function QuestDetail({ quest, isDM, onToggleSub }) {
  if (!quest) return <div className="qdetail"><p className="muted">Select a quest.</p></div>;

  const doneCount = quest.subs.filter(s => s.done).length;

  const statusChip = quest.status === 'completed'
    ? <span className="chip sm" style={{ color: 'var(--live)', borderColor: 'rgba(127,160,95,.4)', background: 'rgba(127,160,95,.1)' }}>✓ Completed</span>
    : <span className="chip gold sm">Active</span>;

  const deadlineChip = quest.deadline
    ? <span className={`deadline${quest.deadlineState ? ' ' + quest.deadlineState : ''}`}>⏱ Due {quest.deadline}</span>
    : <span className="deadline">No deadline</span>;

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
          {deadlineChip}
          {visChip}
          <span style={{ flex: 1 }} />
          <button className="btn sm">✎ Edit</button>
          {isDM && <button className="btn sm">Visibility</button>}
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
              <span className="count-label">{doneCount}/{quest.subs.length} done</span>
            </h3>
            <div className="checklist">
              {quest.subs.map((s, i) => (
                <div
                  key={i}
                  className={`q-check${s.done ? ' on' : ''}`}
                  onClick={() => onToggleSub(quest.id, i)}
                >
                  <span className="q-box" dangerouslySetInnerHTML={{ __html: QI.check }} />
                  <span className="ct">{s.t}</span>
                  {s.deadline && (
                    <span className={`deadline ${s.deadline} cd`}>
                      {s.deadline === 'over' ? 'overdue' : 'soon'}
                    </span>
                  )}
                </div>
              ))}
              <div className="addsub">
                <span className="q-box" style={{ borderStyle: 'dashed' }} />
                Add an objective…
              </div>
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
        </div>

        {/* Right side rail */}
        <aside className="qside">
          <div className="scard">
            <div className="sk">Quest Giver</div>
            <div className="linkrow">
              <span className="av" style={{ width: 32, height: 32, fontSize: 12 }}>
                {quest.giver[0]}
              </span>
              <div>
                <div className="nm">{quest.giver}</div>
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

          <div className="scard">
            <div className="sk">Linked Records</div>
            {quest.links.map((l, i) => (
              <div key={i} className="linkrow">
                <span className="av" style={{ width: 30, height: 30, fontSize: 12 }}
                  dangerouslySetInnerHTML={{ __html: QI[l.i] || '' }}
                />
                <div>
                  <div className="nm">{l.n}</div>
                  <div className="ty">{l.t}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LootView({ isDM }) {
  return (
    <div className="lootwrap">
      <div className="loothead">
        <div>
          <div className="eyebrow">Shared between the party</div>
          <h1>The Pile</h1>
        </div>
        <div className="purse">
          <div className="purse-coin"><b>1,204</b><span>gp</span></div>
          <div className="purse-coin"><b>18</b><span>items</span></div>
          <button className="btn sm" dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Add item' }} />
        </div>
      </div>

      <div className="loottable">
        {/* Header */}
        <div className="lrow lhead">
          <span />
          <span>Item</span>
          <span className="lhfound">Found at</span>
          <span className="lhclaim">Claimed by</span>
          <span className="lhval">Value</span>
        </div>
        {/* Rows */}
        {LOOT.map((it, i) => (
          <div key={i} className="lrow">
            <span className="lthumb" dangerouslySetInnerHTML={{ __html: QI[it.i] || QI.coin }} />
            <span className="litem">
              <div>
                <div className="lnm">{it.name}</div>
                <div className="lsub">{it.sub}</div>
                {it.dmTrue && (
                  <div className="lsub dm-secret dm-only" style={{ '--d': 'block' }}>⛓ {it.dmTrue}</div>
                )}
              </div>
            </span>
            <span className="lfound tiny muted">{it.found}</span>
            <span className="lclaim-col">
              <span className={`lclaim-badge${it.claimOpen ? ' open' : ''}`}>{it.claim}</span>
            </span>
            <span className="lval-col lval">{it.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuestsPage({ isDM, onToggleDM, onToggleNav, onCloseNav }) {
  const [activeTab, setActiveTab]       = useState('quests');
  const [quests, setQuests]             = useState(QUESTS_INITIAL);
  const [selectedId, setSelectedId]     = useState('soul-coins');
  const [filter, setFilter]             = useState('Active');
  const [qlistOpen, setQlistOpen]       = useState(false);

  useEffect(() => {
    document.body.classList.toggle('qlist-open', qlistOpen);
    return () => document.body.classList.remove('qlist-open');
  }, [qlistOpen]);

  function selectQuest(id) {
    setSelectedId(id);
    setQlistOpen(false);
  }

  function toggleSub(questId, subIndex) {
    setQuests(prev => prev.map(q =>
      q.id === questId
        ? { ...q, subs: q.subs.map((s, i) => i === subIndex ? { ...s, done: !s.done } : s) }
        : q
    ));
  }

  function closeAll() {
    onCloseNav();
    setQlistOpen(false);
  }

  const selectedQuest = quests.find(q => q.id === selectedId) || null;

  return (
    <div className="q-app">
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} />

      <div className="q-main">
        <div className="q-topbar">
          <div className="q-left">
            <button className="hamburger btn sm icon" onClick={onToggleNav}
              dangerouslySetInnerHTML={{ __html: MENU_SVG }} />
            {activeTab === 'quests' && (
              <button className="qlistToggle" onClick={() => setQlistOpen(o => !o)}
                dangerouslySetInnerHTML={{ __html: QLIST_SVG }} />
            )}
            <div className="q-tabs">
              <div className={`q-tab${activeTab === 'quests' ? ' on' : ''}`} onClick={() => setActiveTab('quests')}>
                Quest Board
              </div>
              <div className={`q-tab${activeTab === 'loot' ? ' on' : ''}`} onClick={() => setActiveTab('loot')}>
                Party Loot
              </div>
            </div>
          </div>
          <button className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
            <span className={`toggle${isDM ? ' on' : ''}`} />
            DM Mode
          </button>
        </div>

        {/* Quests view */}
        <div className={`q-view${activeTab === 'quests' ? ' on' : ''}`}>
          <div className="qlayout">
            <QuestList
              quests={quests}
              selectedId={selectedId}
              onSelect={selectQuest}
              filter={filter}
              onFilter={setFilter}
              isDM={isDM}
            />
            <QuestDetail
              quest={selectedQuest}
              isDM={isDM}
              onToggleSub={toggleSub}
            />
          </div>
        </div>

        {/* Loot view */}
        <div className={`q-view${activeTab === 'loot' ? ' on' : ''}`}>
          <LootView isDM={isDM} />
        </div>
      </div>

      {/* Shared scrim */}
      <div className="scrim" onClick={closeAll} />
    </div>
  );
}
