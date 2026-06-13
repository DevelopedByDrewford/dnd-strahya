import { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import UserPeekModal from './UserPeekModal';

const SCOPE_LABELS = { pub: 'Public', priv: 'Private', dm: 'DM only' };
const SCOPE_CLS    = { pub: 'tag-pub', priv: 'tag-priv', dm: 'tag-dm' };

function timeAgo(ts) {
  if (!ts?.toMillis) return '—';
  const diff = Date.now() - ts.toMillis();
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function NotesList({ entityId, entityType, entityName, user, profile, isDM }) {
  const userId = user?.uid ?? null;
  const who    = profile?.displayName || user?.email?.split('@')[0] || 'Anonymous';

  const { notes, addNote, updateNote, deleteNote } = useNotes(entityId, { isDM, userId });

  const [filter,    setFilter]    = useState('all');
  const [peekUser,  setPeekUser]  = useState(null);
  const [composing, setComposing] = useState(false);
  const [newBody,   setNewBody]   = useState('');
  const [newScope,  setNewScope]  = useState('pub');
  const [saving,    setSaving]    = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [editBody,  setEditBody]  = useState('');

  const filters = [
    { key: 'all',  label: 'All' },
    { key: 'pub',  label: 'Public' },
    { key: 'mine', label: 'Mine' },
    ...(isDM ? [{ key: 'dm', label: 'DM', dmOnly: true }] : []),
  ];

  const visibleNotes = notes.filter(n => {
    if (filter === 'all')  return true;
    if (filter === 'pub')  return n.scope === 'pub';
    if (filter === 'mine') return n.authorId === userId;
    if (filter === 'dm')   return n.scope === 'dm';
    return true;
  });

  async function handleAdd(e) {
    e.preventDefault();
    if (!newBody.trim() || !user) return;
    setSaving(true);
    try {
      await addNote({ scope: newScope, body: newBody.trim(), who, entityType, entityName });
      setNewBody('');
      setComposing(false);
    } finally { setSaving(false); }
  }

  async function handleEdit(id) {
    if (!editBody.trim()) return;
    await updateNote(id, editBody.trim());
    setEditId(null);
    setEditBody('');
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this note?')) return;
    await deleteNote(id);
  }

  return (
    <>
      {peekUser && (
        <UserPeekModal uid={peekUser.uid} name={peekUser.name} onClose={() => setPeekUser(null)} />
      )}
      <div className="notes-head">
        <h3>Notes</h3>
        <span className="chip sm"><span className="dot-live" /> {notes.length}</span>
      </div>

      <div className="nfilters">
        {filters.map(f => (
          <button
            key={f.key}
            className={`nfilter${filter === f.key ? ' on' : ''}${f.dmOnly ? ' dm-only' : ''}`}
            style={f.dmOnly ? { '--d': 'inline' } : undefined}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibleNotes.map(n => {
        const isOwn = n.authorId === userId;
        const canEdit = isOwn;
        const canDelete = isOwn || isDM;

        return (
          <div key={n.id} className={`note ${n.scope === 'dm' ? 'dmn dm-only' : n.scope === 'priv' ? 'priv' : 'pub'}`}
            style={n.scope === 'dm' ? { '--d': 'block' } : undefined}>
            <div className="note-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`chip sm ${SCOPE_CLS[n.scope]}`}>{SCOPE_LABELS[n.scope]}</span>
                <button className="who-btn" style={{ fontSize: 12 }} onClick={() => setPeekUser({ uid: n.authorId, name: n.who })}>{n.who}</button>
              </div>
              <span className="tiny dim">{timeAgo(n.createdAt)}</span>
            </div>

            {editId === n.id ? (
              <div className="note-edit">
                <textarea
                  className="finput ftarea"
                  rows={3}
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  autoFocus
                />
                <div className="note-edit-ft">
                  <button className="btn xs ghost" onClick={() => setEditId(null)}>Cancel</button>
                  <button className="btn xs primary" onClick={() => handleEdit(n.id)}>Save</button>
                </div>
              </div>
            ) : (
              <div className="note-body">{n.body}</div>
            )}

            {(canEdit || canDelete) && editId !== n.id && (
              <div className="note-actions">
                {canEdit && (
                  <button className="btn xs ghost" onClick={() => { setEditId(n.id); setEditBody(n.body); }}>
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button className="btn xs ghost" style={{ color: 'var(--blood)' }} onClick={() => handleDelete(n.id)}>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {user && !composing && (
        <button className="btn blood nadd" onClick={() => setComposing(true)}>+ Add a note</button>
      )}

      {composing && (
        <form className="note-compose" onSubmit={handleAdd}>
          <div className="note-compose-scope">
            {(isDM ? ['pub', 'priv', 'dm'] : ['pub', 'priv']).map(s => (
              <label key={s} className={`nscope-opt${newScope === s ? ' on' : ''}`}>
                <input type="radio" name="scope" value={s} checked={newScope === s} onChange={() => setNewScope(s)} />
                {SCOPE_LABELS[s]}
              </label>
            ))}
          </div>
          <textarea
            className="finput ftarea"
            rows={3}
            value={newBody}
            onChange={e => setNewBody(e.target.value)}
            placeholder={newScope === 'dm' ? 'DM note — hidden from players…' : newScope === 'priv' ? 'Private thought — only you can see this…' : 'Share with the party…'}
            autoFocus
          />
          <div className="note-compose-ft">
            <button type="button" className="btn xs ghost" onClick={() => { setComposing(false); setNewBody(''); }}>Cancel</button>
            <button type="submit" className="btn xs primary" disabled={saving || !newBody.trim()}>
              {saving ? 'Saving…' : 'Post note'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
