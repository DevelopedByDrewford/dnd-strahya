import { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './ProfileModal.css';

export default function ProfileModal({ user, profile, onClose, onSignOut, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const boxRef = useRef(null);
  const mouseDownOutside = useRef(false);

  const initial = (displayName || user.email)[0].toUpperCase();
  const isDM = profile?.role === 'dm';

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const updates = {
      displayName: displayName.trim() || user.email.split('@')[0],
      avatarUrl: avatarUrl.trim() || null,
    };
    await updateDoc(doc(db, 'users', user.uid), updates);
    onProfileUpdate(updates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSignOut() {
    onSignOut();
    onClose();
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => { mouseDownOutside.current = !boxRef.current?.contains(e.target); }}
      onClick={() => { if (mouseDownOutside.current) onClose(); }}
    >
      <div className="profile-modal" ref={boxRef}>

        <div className="profile-modal-header">
          <div className="profile-avatar-wrap">
            {avatarUrl ? (
              <img className="av" src={avatarUrl} alt="" style={{ width: 56, height: 56 }} onError={() => setAvatarUrl('')} />
            ) : (
              <span className="av" style={{ width: 56, height: 56, fontSize: 22 }}>{initial}</span>
            )}
          </div>
          <div>
            <div className="profile-name">{profile?.displayName ?? user.email}</div>
            <div className="tiny dim">{isDM ? 'Dungeon Master' : 'Player'}</div>
            <div className="tiny dim" style={{ marginTop: 2 }}>{user.email}</div>
          </div>
        </div>

        <hr className="rule" style={{ margin: '16px 0' }} />

        <form onSubmit={handleSave} className="profile-form">
          <label>
            Display Name
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={user.email.split('@')[0]}
              maxLength={40}
            />
          </label>
          <label>
            Avatar URL
            <input
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://…"
            />
            <span className="profile-hint">Paste any image URL</span>
          </label>
          <button type="submit" className={`btn${saved ? ' gold' : ''}`} disabled={saving}>
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        <hr className="rule" style={{ margin: '16px 0' }} />

        <button className="btn ghost profile-signout" onClick={handleSignOut}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
