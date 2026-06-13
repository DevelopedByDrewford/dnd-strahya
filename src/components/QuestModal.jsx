import { useState } from 'react';

const BLANK = {
  name: '',
  status: 'active',
  by: '',
  giver: '',
  location: '',
  visibility: 'players',
  desc: '',
  rewards: '',
  secret: '',
  subs: [],
};

export default function QuestModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? {
    name: initial.name || '',
    status: initial.status || 'active',
    by: initial.by || '',
    giver: initial.giver || '',
    location: initial.location || '',
    visibility: initial.dm ? 'hidden' : 'players',
    desc: initial.desc || '',
    rewards: Array.isArray(initial.rewards) ? initial.rewards.join(', ') : initial.rewards || '',
    secret: initial.secret || '',
    subs: initial.subs ? initial.subs.map(s => ({ t: s.t, done: s.done })) : [],
  } : BLANK);
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function addSub() {
    setForm(f => ({ ...f, subs: [...f.subs, { t: '', done: false }] }));
  }

  function setSub(i, value) {
    setForm(f => ({ ...f, subs: f.subs.map((s, idx) => idx === i ? { ...s, t: value } : s) }));
  }

  function removeSub(i) {
    setForm(f => ({ ...f, subs: f.subs.filter((_, idx) => idx !== i) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        status: form.status,
        by: form.by.trim() || '—',
        giver: form.giver.trim() || '—',
        location: form.location.trim() || '—',
        visibility: form.visibility,
        desc: form.desc.trim(),
        rewards: form.rewards.split(',').map(r => r.trim()).filter(Boolean),
        secret: form.secret.trim(),
        subs: form.subs.filter(s => s.t.trim()).map(s => ({ t: s.t.trim(), done: s.done })),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box loc-modal">
        <div className="modal-hd">
          <h2>{isEdit ? 'Edit Quest' : 'New Quest'}</h2>
          <button className="btn icon ghost" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSave}>
          <div className="frow">
            <label className="flabel">Name <span className="freq">*</span></label>
            <input
              className="finput"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. The Stolen Bones of St. Andral"
              required
              autoFocus
            />
          </div>

          <div className="fgrid-2">
            <div className="frow">
              <label className="flabel">Status</label>
              <select className="finput" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="frow">
              <label className="flabel">Visibility</label>
              <select className="finput" value={form.visibility} onChange={e => set('visibility', e.target.value)}>
                <option value="players">Visible to players</option>
                <option value="hidden">Hidden (DM only)</option>
              </select>
            </div>
          </div>

          <div className="fgrid-2">
            <div className="frow">
              <label className="flabel">Quest Giver</label>
              <input
                className="finput"
                value={form.giver}
                onChange={e => set('giver', e.target.value)}
                placeholder="e.g. Father Lucian"
              />
            </div>
            <div className="frow">
              <label className="flabel">Location</label>
              <input
                className="finput"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g. Vallaki"
              />
            </div>
          </div>

          <div className="frow">
            <label className="flabel">Added by</label>
            <input
              className="finput"
              value={form.by}
              onChange={e => set('by', e.target.value)}
              placeholder="e.g. Tessa"
            />
          </div>

          <div className="frow">
            <label className="flabel">Description</label>
            <textarea
              className="finput ftarea"
              rows={3}
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
              placeholder="What the party knows about this quest…"
            />
          </div>

          <div className="frow">
            <label className="flabel">Objectives</label>
            {form.subs.map((s, i) => (
              <div key={i} className="qm-sub-row">
                <input
                  className="finput"
                  value={s.t}
                  onChange={e => setSub(i, e.target.value)}
                  placeholder={`Objective ${i + 1}`}
                />
                <button type="button" className="btn icon ghost" onClick={() => removeSub(i)} aria-label="Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
            <button type="button" className="btn sm ghost" onClick={addSub} style={{ marginTop: 6 }}>
              + Add objective
            </button>
          </div>

          <div className="frow">
            <label className="flabel">Rewards</label>
            <input
              className="finput"
              value={form.rewards}
              onChange={e => set('rewards', e.target.value)}
              placeholder="Comma-separated — e.g. Ireena's trust, 500 gp"
            />
          </div>

          <div className="frow fdm-note">
            <label className="flabel">⛓ Secrets &amp; DM Notes</label>
            <textarea
              className="finput ftarea ftarea-sm"
              rows={3}
              value={form.secret}
              onChange={e => set('secret', e.target.value)}
              placeholder="Hidden objectives, true nature, plot connections…"
            />
          </div>

          <div className="modal-ft">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
