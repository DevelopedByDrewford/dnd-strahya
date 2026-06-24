import { useState } from 'react';
import './SettingsModal.css';

const SECTIONS = [
  {
    label: 'Campaign',
    fields: [
      { key: 'title', placeholder: 'Curse of Strahd', label: 'Title' },
      { key: 'subtitle', placeholder: 'The Tome', label: 'Subtitle' },
    ],
  },
  {
    label: 'Home',
    fields: [
      { key: 'homeTitle', placeholder: 'The Land of Barovia', label: 'Title' },
      { key: 'homeSubtitle', placeholder: 'The Mists Do Not Lift.', label: 'Subtitle' },
    ],
  },
  {
    label: 'Timeline',
    fields: [
      { key: 'timelineTitle', placeholder: 'The Chronicle of Barovia', label: 'Title' },
      { key: 'timelineSubtitle', placeholder: 'The Story So Far', label: 'Subtitle' },
    ],
  },
  {
    label: 'Loot',
    fields: [
      { key: 'lootTitle', placeholder: 'Shared between the party', label: 'Title' },
      { key: 'lootSubtitle', placeholder: 'The Pile', label: 'Subtitle' },
    ],
  },
];

export default function SettingsModal({ settings, onUpdate, onClose }) {
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Check console for details.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-hd">
          <span>Campaign Settings</span>
          <button className="btn icon ghost" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <form className="settings-body" onSubmit={handleSave}>
          {SECTIONS.map(({ label, fields }) => (
            <div key={label} className="settings-section">
              <div className="settings-section-label">{label}</div>
              {fields.map(({ key, placeholder, label: fieldLabel }) => (
                <label key={key} className="settings-field">
                  <span>{fieldLabel}</span>
                  <input
                    value={form[key] ?? ''}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </label>
              ))}
            </div>
          ))}
          <div className="settings-ft">
            <button type="submit" className="btn" disabled={saving}>
              {saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
