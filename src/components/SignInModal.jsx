import { useState } from 'react';
import './SignInModal.css';

export default function SignInModal({ onSignIn, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSignIn(email, password);
      onClose();
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-sigil">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-2)" strokeWidth="1.4">
            <path d="M5 3h11l3 3v15H5z"/><path d="M16 3v3h3"/>
            <path d="M8 9h7M8 12h7M8 15h5"/>
          </svg>
        </div>
        <h2 className="modal-title">Welcome, Adventurer</h2>
        <p className="modal-sub">Sign in to access The Tome</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="btn blood" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
