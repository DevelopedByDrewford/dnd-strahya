import { useState } from 'react';
import { PARENT_OPTIONS } from '../hooks/useLocations';
import LinkedRecordPicker from './LinkedRecordPicker';

const ICON_OPTIONS = [
  { value: 'pin',    label: 'Pin (generic)' },
  { value: 'inn',    label: 'Inn / Tavern' },
  { value: 'church', label: 'Church / Temple' },
  { value: 'castle', label: 'Castle / Fortress' },
  { value: 'door',   label: 'Building / Room' },
];

const BLANK = {
  name: '',
  parentId: 'barovia',
  iconType: 'pin',
  locationType: '',
  visibility: 'players',
  tags: '',
  desc: '',
  secret: '',
  imageUrl: '',
  people: [],
  quests: [],
};

function toForm(loc) {
  return {
    name: loc.name || '',
    parentId: loc.parentId || 'barovia',
    iconType: loc.iconType || 'pin',
    locationType: loc.locationType || '',
    visibility: loc.visibility || 'players',
    tags: Array.isArray(loc.tags) ? loc.tags.join(', ') : (loc.tags || ''),
    desc: Array.isArray(loc.desc) ? loc.desc.join('\n\n') : (loc.desc || ''),
    secret: loc.secret || '',
    imageUrl: loc.imageUrl || '',
    people: loc.people || [],
    quests: loc.quests || [],
  };
}

export default function LocationModal({ initial, onSave, onClose, characters = [], quests = [], isDM = false }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? toForm(initial) : BLANK);
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
        parentId: form.parentId,
        iconType: form.iconType,
        locationType: form.locationType.trim() || 'Location',
        visibility: form.visibility,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        desc: form.desc.trim().split(/\n\n+/).map(p => p.trim()).filter(Boolean),
        secret: form.secret.trim(),
        imageUrl: form.imageUrl.trim(),
        people: form.people,
        quests: form.quests,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const charOptions = characters.map(c => ({ id: c.id, name: c.name || c.n, kind: 'character' }));
  const questOptions = quests.map(q => ({ id: q.id, name: q.name, kind: 'quest' }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box loc-modal">
        <div className="modal-hd">
          <h2>{isEdit ? 'Edit Location' : 'New Location'}</h2>
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
              placeholder="e.g. The Wachterhaus"
              required
              autoFocus
            />
          </div>

          <div className="fgrid-2">
            <div className="frow">
              <label className="flabel">Parent Location</label>
              <select className="finput" value={form.parentId} onChange={e => set('parentId', e.target.value)}>
                {PARENT_OPTIONS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="frow">
              <label className="flabel">Icon</label>
              <select className="finput" value={form.iconType} onChange={e => set('iconType', e.target.value)}>
                {ICON_OPTIONS.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="fgrid-2">
            <div className="frow">
              <label className="flabel">Type</label>
              <input
                className="finput"
                value={form.locationType}
                onChange={e => set('locationType', e.target.value)}
                placeholder="e.g. Manor House"
              />
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
            <label className="flabel">Tags</label>
            <input
              className="finput"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="Comma-separated — e.g. Safe haven, Cult activity"
            />
          </div>

          <div className="frow">
            <label className="flabel">Description</label>
            <textarea
              className="finput ftarea"
              rows={5}
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
              placeholder="What players see and experience here… (blank line between paragraphs)"
            />
          </div>

          <div className="frow">
            <label className="flabel">Banner Image URL</label>
            <input
              className="finput"
              type="url"
              value={form.imageUrl}
              onChange={e => set('imageUrl', e.target.value)}
              placeholder="https://… (paste any image URL)"
            />
            {form.imageUrl && (
              <div className="fimg-preview">
                <img src={form.imageUrl} alt="preview" onError={e => e.currentTarget.style.display = 'none'} />
              </div>
            )}
          </div>

          <div className="frow">
            <label className="flabel">Who is here</label>
            <LinkedRecordPicker
              items={form.people}
              onChange={v => set('people', v)}
              options={charOptions}
              labelPlaceholder="Role (e.g. Innkeeper, Guard)"
            />
          </div>

          <div className="frow">
            <label className="flabel">Linked Quests</label>
            <LinkedRecordPicker
              items={form.quests}
              onChange={v => set('quests', v)}
              options={questOptions}
            />
          </div>

          {isDM && (
            <div className="frow fdm-note">
              <label className="flabel">⛓ Secrets &amp; DM Notes</label>
              <textarea
                className="finput ftarea ftarea-sm"
                rows={3}
                value={form.secret}
                onChange={e => set('secret', e.target.value)}
                placeholder="Hidden truths, prep notes, connections to other locations…"
              />
            </div>
          )}

          <div className="modal-ft">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
