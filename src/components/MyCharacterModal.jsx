import { useState } from 'react';

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

const AB_KEYS   = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const AB_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

function modStr(score) {
  const n = parseInt(score) || 10;
  const m = Math.floor((n - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

const BLANK = {
  name: '', race: '', charClass: '', subclass: '',
  level: 1, alignment: '', background: '', backstory: '',
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  ac: 10, hpMax: 10, hpCurrent: 10, speed: 30, initiative: '+0', profBonus: '+2',
  imageUrl: '',
};

export default function MyCharacterModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? { ...BLANK, ...initial } : BLANK);
  const [saving, setSaving] = useState(false);

  function set(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const level = parseInt(form.level) || 1;
      const sub = [form.race, form.charClass, `Level ${level}`].filter(Boolean).join(' · ');
      const rosterRole = [form.charClass, form.subclass].filter(Boolean).join(' — ');
      await onSave({
        name: form.name.trim(),
        race: form.race.trim(),
        charClass: form.charClass.trim(),
        subclass: form.subclass.trim(),
        level,
        alignment: form.alignment,
        background: form.background.trim(),
        backstory: form.backstory.trim(),
        str: parseInt(form.str) || 10,
        dex: parseInt(form.dex) || 10,
        con: parseInt(form.con) || 10,
        int: parseInt(form.int) || 10,
        wis: parseInt(form.wis) || 10,
        cha: parseInt(form.cha) || 10,
        ac: parseInt(form.ac) || 10,
        hpMax: parseInt(form.hpMax) || 10,
        hpCurrent: parseInt(form.hpCurrent) || 10,
        speed: parseInt(form.speed) || 30,
        initiative: form.initiative.trim(),
        profBonus: form.profBonus.trim(),
        sub,
        rosterRole,
        imageUrl: form.imageUrl.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hd">
          <h2>{isEdit ? 'Edit Character' : 'Create Your Character'}</h2>
          <button className="btn icon ghost" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSave}>
          <div className="frow">
            <label className="flabel">Character Name <span className="freq">*</span></label>
            <input className="finput" value={form.name} onChange={e => set('name', e.target.value)}
              required autoFocus placeholder="e.g. Tessa Brightwood" />
          </div>

          <div className="fgrid-3">
            <div className="frow">
              <label className="flabel">Race</label>
              <input className="finput" value={form.race} onChange={e => set('race', e.target.value)} placeholder="Half-elf" />
            </div>
            <div className="frow">
              <label className="flabel">Class</label>
              <input className="finput" value={form.charClass} onChange={e => set('charClass', e.target.value)} placeholder="Cleric" />
            </div>
            <div className="frow">
              <label className="flabel">Subclass</label>
              <input className="finput" value={form.subclass} onChange={e => set('subclass', e.target.value)} placeholder="Life Domain" />
            </div>
          </div>

          <div className="fgrid-3">
            <div className="frow">
              <label className="flabel">Level</label>
              <input className="finput" type="number" min="1" max="20" value={form.level}
                onChange={e => set('level', e.target.value)} />
            </div>
            <div className="frow">
              <label className="flabel">Alignment</label>
              <select className="finput" value={form.alignment} onChange={e => set('alignment', e.target.value)}>
                <option value="">—</option>
                {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="frow">
              <label className="flabel">Background</label>
              <input className="finput" value={form.background} onChange={e => set('background', e.target.value)} placeholder="Acolyte" />
            </div>
          </div>

          <div className="frow">
            <label className="flabel">Ability Scores</label>
            <div className="fgrid-ab">
              {AB_KEYS.map(ab => (
                <div key={ab} className="frow-ab">
                  <label className="flabel">{AB_LABELS[ab]}</label>
                  <input className="finput" type="number" min="1" max="30"
                    value={form[ab]} onChange={e => set(ab, e.target.value)} />
                  <div className="fmod">{modStr(form[ab])}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="fgrid-3">
            <div className="frow">
              <label className="flabel">Armor Class</label>
              <input className="finput" type="number" value={form.ac} onChange={e => set('ac', e.target.value)} />
            </div>
            <div className="frow">
              <label className="flabel">HP Max</label>
              <input className="finput" type="number" value={form.hpMax} onChange={e => set('hpMax', e.target.value)} />
            </div>
            <div className="frow">
              <label className="flabel">HP Current</label>
              <input className="finput" type="number" value={form.hpCurrent} onChange={e => set('hpCurrent', e.target.value)} />
            </div>
          </div>

          <div className="fgrid-3">
            <div className="frow">
              <label className="flabel">Speed (ft.)</label>
              <input className="finput" value={form.speed} onChange={e => set('speed', e.target.value)} />
            </div>
            <div className="frow">
              <label className="flabel">Initiative</label>
              <input className="finput" value={form.initiative} onChange={e => set('initiative', e.target.value)} placeholder="+2" />
            </div>
            <div className="frow">
              <label className="flabel">Prof. Bonus</label>
              <input className="finput" value={form.profBonus} onChange={e => set('profBonus', e.target.value)} placeholder="+3" />
            </div>
          </div>

          <div className="frow">
            <label className="flabel">Portrait URL</label>
            <input className="finput" type="url" value={form.imageUrl}
              onChange={e => set('imageUrl', e.target.value)}
              placeholder="https://example.com/portrait.jpg" />
            {form.imageUrl && (
              <div className="fimg-preview">
                <img src={form.imageUrl} alt="Portrait preview" onError={e => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div className="frow">
            <label className="flabel">Backstory</label>
            <textarea className="finput ftarea" rows={4} value={form.backstory}
              onChange={e => set('backstory', e.target.value)}
              placeholder="Who is your character? What brought them to Barovia?" />
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
