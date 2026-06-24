import { useState, useEffect } from 'react';
import LinkedRecordPicker from './LinkedRecordPicker';

const KINDS = ['', 'milestone', 'dramatic'];
const KIND_LABELS = { '': 'Normal', milestone: 'Milestone', dramatic: 'Turning Point' };

export default function TimelineEntryModal({ entry, defaultAuthor, onSave, onClose, linkedOptions = [] }) {
  const [form, setForm] = useState(() => ({
    session: '',
    day: '',
    kind: '',
    title: '',
    body: '',
    dmNote: '',
    author: defaultAuthor || '',
    hidden: false,
    links: [],
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setForm({
        session: entry.session || '',
        day: entry.day || '',
        kind: entry.kind || '',
        title: entry.title || '',
        body: entry.body || '',
        dmNote: entry.dmNote || '',
        author: entry.author || defaultAuthor || '',
        hidden: entry.hidden || false,
        links: (entry.links || []).filter(l => l.id && l.kind),
      });
    }
  }, [entry, defaultAuthor]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.session.trim()) return;
    setSaving(true);
    try {
      await onSave({
        session: form.session.trim(),
        day: form.day.trim(),
        kind: form.kind,
        title: form.title.trim(),
        body: form.body.trim(),
        dmNote: form.dmNote.trim() || null,
        author: form.author.trim() || null,
        hidden: form.hidden,
        links: form.links,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box tl-modal">
        <div className="modal-hd">
          <h2>{entry ? 'Edit Entry' : 'New Timeline Entry'}</h2>
          <button className="btn icon ghost" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form className="modal-body tl-modal-form" onSubmit={handleSave}>
          <div className="fgrid-2">
            <div className="frow">
              <label className="flabel">Session <span className="freq">*</span></label>
              <input className="finput" value={form.session} onChange={e => set('session', e.target.value)}
                placeholder="Session 13" required autoFocus />
            </div>
            <div className="frow">
              <label className="flabel">In-world Day</label>
              <input className="finput" value={form.day} onChange={e => set('day', e.target.value)}
                placeholder="Day 8 — Waning of the Crow Moon" />
            </div>
          </div>

          <div className="fgrid-2">
            <div className="frow">
              <label className="flabel">Kind</label>
              <select className="finput" value={form.kind} onChange={e => set('kind', e.target.value)}>
                {KINDS.map(k => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
              </select>
            </div>
            <div className="frow frow-check frow-check-mid">
              <label className="fcheck">
                <input type="checkbox" checked={form.hidden} onChange={e => set('hidden', e.target.checked)} />
                Hidden from players
              </label>
            </div>
          </div>

          <div className="frow">
            <label className="flabel">Title <span className="freq">*</span></label>
            <input className="finput" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="What happened this session?" required />
          </div>

          <div className="frow">
            <label className="flabel">Body</label>
            <textarea className="finput ftarea" rows={5} value={form.body}
              onChange={e => set('body', e.target.value)}
              placeholder="Narrative summary of the session..." />
          </div>

          <div className="frow">
            <label className="flabel">Linked Articles</label>
            <LinkedRecordPicker
              items={form.links}
              onChange={links => set('links', links)}
              options={linkedOptions}
            />
          </div>

          <div className="frow">
            <label className="flabel">Logged by</label>
            <input className="finput" value={form.author} onChange={e => set('author', e.target.value)}
              placeholder="Author name..." />
          </div>

          <div className="frow">
            <label className="flabel">DM Note</label>
            <textarea className="finput ftarea ftarea-sm" rows={3} value={form.dmNote}
              onChange={e => set('dmNote', e.target.value)}
              placeholder="Prep notes, foreshadowing, secrets..." />
          </div>

          <div className="modal-ft">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Saving…' : (entry ? 'Save changes' : 'Create entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
