import { useState } from 'react';

const GROUPS = ['The Party', 'Allies', 'Enemies', 'Hidden'];

const BLANK = {
  name: '',
  sub: '',
  rosterRole: '',
  group: 'Allies',
  dot: 'neutral',
  visibility: 'players',
  appearance: '',
  personality: '',
  secret: '',
};

export default function CharacterModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? {
    name: initial.name || '',
    sub: initial.sub || '',
    rosterRole: initial.rosterRole || '',
    group: initial.group || 'Allies',
    dot: initial.dot || 'neutral',
    visibility: initial.visibility || 'players',
    appearance: Array.isArray(initial.appearance) ? initial.appearance.join('\n\n') : initial.appearance || '',
    personality: initial.personality || '',
    secret: initial.secret || '',
  } : BLANK);
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        sub: form.sub.trim(),
        rosterRole: form.rosterRole.trim() || form.sub.trim(),
        group: form.group,
        dot: form.dot,
        visibility: form.visibility,
        appearance: form.appearance.trim(),
        personality: form.personality.trim(),
        secret: form.secret.trim(),
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
          <h2>{isEdit ? 'Edit Character' : 'New Character'}</h2>
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
              placeholder="e.g. Strahd von Zarovich"
              required
              autoFocus
            />
          </div>

          <div className="frow">
            <label className="flabel">Subtitle</label>
            <input
              className="finput"
              value={form.sub}
              onChange={e => set('sub', e.target.value)}
              placeholder="e.g. The Devil of Barovia, Lord of Ravenloft"
            />
          </div>

          <div className="fgrid-2">
            <div className="frow">
              <label className="flabel">Group</label>
              <select className="finput" value={form.group} onChange={e => set('group', e.target.value)}>
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="frow">
              <label className="flabel">Roster Role</label>
              <input
                className="finput"
                value={form.rosterRole}
                onChange={e => set('rosterRole', e.target.value)}
                placeholder="e.g. Cleric · Lv 5"
              />
            </div>
          </div>

          <div className="fgrid-2">
            <div className="frow">
              <label className="flabel">Standing</label>
              <select className="finput" value={form.dot} onChange={e => set('dot', e.target.value)}>
                <option value="good">Friendly</option>
                <option value="neutral">Neutral</option>
                <option value="bad">Hostile</option>
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

          <div className="frow">
            <label className="flabel">Appearance</label>
            <textarea
              className="finput ftarea"
              rows={3}
              value={form.appearance}
              onChange={e => set('appearance', e.target.value)}
              placeholder="Physical description, mannerisms, attire…"
            />
          </div>

          <div className="frow">
            <label className="flabel">Personality</label>
            <textarea
              className="finput ftarea ftarea-sm"
              rows={2}
              value={form.personality}
              onChange={e => set('personality', e.target.value)}
              placeholder="Traits, ideals, flaws…"
            />
          </div>

          <div className="frow fdm-note">
            <label className="flabel">⛓ Secrets &amp; DM Notes</label>
            <textarea
              className="finput ftarea ftarea-sm"
              rows={3}
              value={form.secret}
              onChange={e => set('secret', e.target.value)}
              placeholder="Hidden motives, true nature, plot connections…"
            />
          </div>

          <div className="modal-ft">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
