import { useState } from 'react';
import './LinkedRecordPicker.css';

// options: [{ id, name, kind }]  kind = 'character' | 'location' | 'quest'
// items:   [{ id, name, kind, label? }]  label = optional relationship note (type / role)
export default function LinkedRecordPicker({ items = [], onChange, options = [], labelPlaceholder }) {
  const [pendingId, setPendingId] = useState('');
  const [pendingLabel, setPendingLabel] = useState('');

  const available = options.filter(o => !items.find(it => it.id === o.id));

  function add() {
    const opt = available.find(o => o.id === pendingId);
    if (!opt) return;
    onChange([...items, { id: opt.id, name: opt.name, kind: opt.kind, label: pendingLabel.trim() }]);
    setPendingId('');
    setPendingLabel('');
  }

  function remove(id) {
    onChange(items.filter(it => it.id !== id));
  }

  const kindLabel = { character: 'Character', location: 'Location', quest: 'Quest' };

  return (
    <div className="lrp">
      {items.length > 0 && (
        <div className="lrp-list">
          {items.map(it => (
            <div key={it.id} className="lrp-item">
              <div className="lrp-item-info">
                <div className="lrp-item-kind">{kindLabel[it.kind] || it.kind}</div>
                <div className="lrp-item-name">{it.name}</div>
                {it.label && <div className="lrp-item-label">{it.label}</div>}
              </div>
              <button type="button" className="lrp-remove" onClick={() => remove(it.id)} aria-label="Remove">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="lrp-add">
        <select
          className="finput"
          value={pendingId}
          onChange={e => setPendingId(e.target.value)}
        >
          <option value="">— Select record —</option>
          {['character', 'location', 'quest'].map(k =>
            available.filter(o => o.kind === k).length > 0 && (
              <optgroup key={k} label={kindLabel[k] + 's'}>
                {available.filter(o => o.kind === k).map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </optgroup>
            )
          )}
        </select>
        {labelPlaceholder && pendingId && (
          <input
            className="finput"
            placeholder={labelPlaceholder}
            value={pendingLabel}
            onChange={e => setPendingLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          />
        )}
        <button type="button" className="btn sm" onClick={add} disabled={!pendingId}>
          Add
        </button>
      </div>
    </div>
  );
}
