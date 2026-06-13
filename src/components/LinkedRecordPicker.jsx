import { useState } from 'react';
import './LinkedRecordPicker.css';

// options: [{ id, name, kind }]  kind = 'character' | 'location' | 'quest'
// items:   [{ id, name, kind, label? }]
export default function LinkedRecordPicker({ items = [], onChange, options = [], labelPlaceholder }) {
  const [adding, setAdding] = useState(false);
  const [pendingLabel, setPendingLabel] = useState('');

  const available = options.filter(o => !items.find(it => it.id === o.id));

  function handleSelect(e) {
    const id = e.target.value;
    if (!id) return;
    const opt = available.find(o => o.id === id);
    if (!opt) return;
    onChange([...items, { id: opt.id, name: opt.name, kind: opt.kind, label: pendingLabel.trim() }]);
    setPendingLabel('');
    setAdding(false);
  }

  function cancel() {
    setAdding(false);
    setPendingLabel('');
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
              <button type="button" className="lrp-remove" onClick={() => onChange(items.filter(it2 => it2.id !== it.id))} aria-label="Remove">×</button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="lrp-new">
          {labelPlaceholder && (
            <input
              className="finput"
              placeholder={labelPlaceholder}
              value={pendingLabel}
              onChange={e => setPendingLabel(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && cancel()}
              autoFocus
            />
          )}
          <select
            className="finput"
            value=""
            onChange={handleSelect}
            autoFocus={!labelPlaceholder}
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
          <button type="button" className="btn sm ghost lrp-cancel" onClick={cancel}>✕</button>
        </div>
      ) : (
        available.length > 0 && (
          <button type="button" className="lrp-trigger" onClick={() => setAdding(true)}>
            + New record…
          </button>
        )
      )}
    </div>
  );
}
