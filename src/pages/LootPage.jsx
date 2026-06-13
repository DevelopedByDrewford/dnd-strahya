import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useLoot } from '../hooks/useLoot';
import { QI } from '../data/quests';
import './LootPage.css';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';
const CURRENT_USER = 'Tessa';

const MENU_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
const PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';

const ICON_KEYS = ['coin', 'sword', 'potion', 'book'];

// ── ClaimControl ──────────────────────────────────────────────────────────────

function ClaimControl({ item, isDM, onClaim, onRelease }) {
  const isOpen = item.claimOpen || !item.claimBy;
  const isMine = item.claimBy === CURRENT_USER;
  const canRelease = isMine || isDM;

  if (isOpen) {
    return (
      <button className="lt-claim open" onClick={() => onClaim(item.id, CURRENT_USER)}>
        Up for grabs
      </button>
    );
  }

  return (
    <button
      className={`lt-claim${canRelease ? ' releasable' : ''}`}
      onClick={canRelease ? () => onRelease(item.id) : undefined}
      title={canRelease ? 'Click to release' : undefined}
    >
      {item.claimBy}
    </button>
  );
}

// ── LootRow ───────────────────────────────────────────────────────────────────

function LootRow({ item, isDM, onClaim, onRelease }) {
  return (
    <div className="lt-row">
      <span
        className="lt-thumb"
        dangerouslySetInnerHTML={{ __html: QI[item.icon] || QI.coin }}
      />
      <span className="lt-item">
        <span className="lt-nm">{item.name}</span>
        {item.subtitle && <span className="lt-sub">{item.subtitle}</span>}
        {item.dmTrue && (
          <span className="lt-sub lt-secret dm-only" style={{ '--d': 'block' }}>
            ⛓ {item.dmTrue}
          </span>
        )}
      </span>
      <span className="lt-found">{item.foundAt}</span>
      <span className="lt-claim-col">
        <ClaimControl item={item} isDM={isDM} onClaim={onClaim} onRelease={onRelease} />
      </span>
      <span className="lt-val">{item.value}</span>
    </div>
  );
}

// ── LootTable ─────────────────────────────────────────────────────────────────

function LootTable({ items, isDM, onClaim, onRelease, onAdd }) {
  if (!items.length) {
    return (
      <div className="lt-empty">
        <p className="muted">No loot pooled yet.</p>
        <button
          className="btn sm"
          onClick={onAdd}
          dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Add item' }}
        />
      </div>
    );
  }

  return (
    <div className="lt-table">
      <div className="lt-head-row">
        <span />
        <span>Item</span>
        <span className="lt-hfound">Found at</span>
        <span className="lt-hclaim">Claimed by</span>
        <span className="lt-hval">Value</span>
      </div>
      {items.map(item => (
        <LootRow
          key={item.id}
          item={item}
          isDM={isDM}
          onClaim={onClaim}
          onRelease={onRelease}
        />
      ))}
    </div>
  );
}

// ── AddLootModal ──────────────────────────────────────────────────────────────

function AddLootModal({ isDM, onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    icon: 'coin',
    foundAt: '',
    quantity: 1,
    value: '',
    recordVisibility: 'public',
    dmNote: '',
  });

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const { dmNote, ...rest } = form;
    onAdd({ ...rest, dmNote: dmNote.trim() || null });
    onClose();
  }

  return (
    <div className="lt-overlay" onClick={onClose}>
      <div className="lt-modal" onClick={e => e.stopPropagation()}>
        <div className="lt-modal-head">
          <h2>Add Loot</h2>
          <button className="btn sm ghost" onClick={onClose}>✕</button>
        </div>

        <form className="lt-form" onSubmit={handleSubmit}>
          <div className="lt-field">
            <label>Name *</label>
            <input
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Item name"
            />
          </div>

          <div className="lt-field">
            <label>Subtitle</label>
            <input
              value={form.subtitle}
              onChange={e => set('subtitle', e.target.value)}
              placeholder="Description or quantity"
            />
          </div>

          <div className="lt-field">
            <label>Icon</label>
            <div className="lt-icon-grid">
              {ICON_KEYS.map(k => (
                <button
                  key={k}
                  type="button"
                  className={`lt-icon-opt${form.icon === k ? ' sel' : ''}`}
                  onClick={() => set('icon', k)}
                  dangerouslySetInnerHTML={{ __html: QI[k] }}
                  title={k}
                />
              ))}
            </div>
          </div>

          <div className="lt-row-2">
            <div className="lt-field">
              <label>Found at</label>
              <input
                value={form.foundAt}
                onChange={e => set('foundAt', e.target.value)}
                placeholder="Location"
              />
            </div>
            <div className="lt-field">
              <label>Value</label>
              <input
                value={form.value}
                onChange={e => set('value', e.target.value)}
                placeholder="150 gp, Priceless, ??"
              />
            </div>
          </div>

          {isDM && (
            <>
              <div className="lt-field">
                <label>Visibility</label>
                <select value={form.recordVisibility} onChange={e => set('recordVisibility', e.target.value)}>
                  <option value="public">Public (all players)</option>
                  <option value="dm">DM only (hidden)</option>
                </select>
              </div>
              <div className="lt-field">
                <label>DM Note — True identity</label>
                <textarea
                  value={form.dmNote}
                  onChange={e => set('dmNote', e.target.value)}
                  placeholder="What this item really is (not shown to players)"
                />
              </div>
            </>
          )}

          <div className="lt-form-actions">
            <button type="submit" className="btn gold">Add to pile</button>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── LootPage ──────────────────────────────────────────────────────────────────

export default function LootPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === 'true');

  const { items, totalGp, addItem, claimItem } = useLoot(CAMPAIGN_ID, { isDM, userId: CURRENT_USER });

  useEffect(() => {
    if (searchParams.get('new') !== 'true') return;
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('new'); return n; }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(data) {
    try {
      await addItem(data);
    } catch {
      // Firestore not configured; no-op until auth is wired up.
    }
  }

  async function handleClaim(id, by) {
    try {
      await claimItem(id, by);
    } catch {
      // no-op
    }
  }

  async function handleRelease(id) {
    try {
      await claimItem(id, null);
    } catch {
      // no-op
    }
  }

  const gpLabel = totalGp > 0 ? totalGp.toLocaleString() : '—';

  return (
    <div className="lt-app">
      <div className="scrim" onClick={onCloseNav} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />

      <div className="lt-main">
        <div className="lt-topbar">
          <button
            className="hamburger btn sm icon"
            onClick={onToggleNav}
            dangerouslySetInnerHTML={{ __html: MENU_SVG }}
          />
          {profile?.role === 'dm' && (
            <button className={`dmswitch${isDM ? ' on' : ''}`} onClick={onToggleDM}>
              <span className={`toggle${isDM ? ' on' : ''}`} />
              DM Mode
            </button>
          )}
        </div>

        <div className="lt-wrap">
          <div className="lt-head">
            <div>
              <div className="eyebrow">Shared between the party</div>
              <h1>The Pile</h1>
            </div>
            <div className="lt-purse">
              <div className="lt-purse-coin">
                <b>{gpLabel}</b>
                <span>gp</span>
              </div>
              <div className="lt-purse-coin">
                <b>{items.length}</b>
                <span>items</span>
              </div>
              <button
                className="btn sm"
                onClick={() => setModalOpen(true)}
                dangerouslySetInnerHTML={{ __html: PLUS_SVG + ' Add item' }}
              />
            </div>
          </div>

          <LootTable
            items={items}
            isDM={isDM}
            onClaim={handleClaim}
            onRelease={handleRelease}
            onAdd={() => setModalOpen(true)}
          />
        </div>
      </div>

      {modalOpen && (
        <AddLootModal
          isDM={isDM}
          onClose={() => setModalOpen(false)}
          onAdd={handleAdd}
        />
      )}

    </div>
  );
}
