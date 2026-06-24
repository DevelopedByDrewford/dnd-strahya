import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useLoot } from '../hooks/useLoot';
import { useSettings } from '../hooks/useSettings';
import { QI } from '../data/quests';
import './LootPage.css';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';
const CURRENT_USER = 'Tessa';


const PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>';
const PENCIL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/></svg>';

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

function LootRow({ item, isDM, onClaim, onRelease, onEdit }) {
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
      <span className="lt-edit-col">
        <button
          className="lt-edit-btn"
          onClick={() => onEdit(item)}
          title="Edit item"
          dangerouslySetInnerHTML={{ __html: PENCIL_SVG }}
        />
      </span>
    </div>
  );
}

// ── LootTable ─────────────────────────────────────────────────────────────────

function LootTable({ items, isDM, onClaim, onRelease, onAdd, onEdit }) {
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
        <span />
      </div>
      {items.map(item => (
        <LootRow
          key={item.id}
          item={item}
          isDM={isDM}
          onClaim={onClaim}
          onRelease={onRelease}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

// ── AddLootModal ──────────────────────────────────────────────────────────────

function AddLootModal({ isDM, onClose, onAdd, onSave, onDelete, initialItem }) {
  const isEdit = !!initialItem;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState(isEdit ? {
    name: initialItem.name || '',
    subtitle: initialItem.subtitle || '',
    icon: initialItem.icon || 'coin',
    foundAt: initialItem.foundAt || '',
    quantity: initialItem.quantity || 1,
    value: initialItem.value || '',
    recordVisibility: initialItem.recordVisibility || 'public',
    dmNote: '',
  } : {
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
    if (isEdit) {
      onSave({ ...rest, dmNote: dmNote.trim() || null });
    } else {
      onAdd({ ...rest, dmNote: dmNote.trim() || null });
    }
    onClose();
  }

  return (
    <div className="lt-overlay" onClick={onClose}>
      <div className="lt-modal" onClick={e => e.stopPropagation()}>
        <div className="lt-modal-head">
          <h2>{isEdit ? 'Edit Loot' : 'Add Loot'}</h2>
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

          {confirmDelete ? (
            <div className="lt-form-actions lt-delete-confirm">
              <span className="lt-delete-label">Delete this item?</span>
              <button type="button" className="btn danger" onClick={() => { onDelete(); onClose(); }}>Yes, delete</button>
              <button type="button" className="btn ghost" onClick={() => setConfirmDelete(false)}>Never mind</button>
            </div>
          ) : (
            <div className="lt-form-actions">
              <button type="submit" className="btn gold">{isEdit ? 'Save changes' : 'Add to pile'}</button>
              <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
              {isEdit && (
                <button type="button" className="btn ghost lt-delete-trigger" onClick={() => setConfirmDelete(true)}>
                  Delete
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ── LootPage ──────────────────────────────────────────────────────────────────

export default function LootPage({ isDM, onToggleDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === 'true');
  const [editingItem, setEditingItem] = useState(null);
  const { settings } = useSettings();

  const { items, totalGp, addItem, claimItem, updateItem, deleteItem } = useLoot(CAMPAIGN_ID, { isDM, userId: CURRENT_USER });

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

  async function handleSave(id, data) {
    try {
      const { dmNote, ...rest } = data;
      await updateItem(id, rest);
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
        <Topbar
          onToggleNav={onToggleNav}
          isDM={isDM}
          onToggleDM={onToggleDM}
          profile={profile}
          crumb={<>World › <b>Loot</b></>}
        />

        <div className="lt-wrap">
          <div className="lt-head">
            <div>
              <div className="eyebrow">{settings.lootTitle}</div>
              <h1>{settings.lootSubtitle}</h1>
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
            onEdit={item => setEditingItem(item)}
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

      {editingItem && (
        <AddLootModal
          isDM={isDM}
          initialItem={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={data => handleSave(editingItem.id, data)}
          onDelete={async () => { try { await deleteItem(editingItem.id); } catch {} }}
        />
      )}

    </div>
  );
}
