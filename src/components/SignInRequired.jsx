import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MyCharacterPage.css';

const MENU_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
const USER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';

export default function SignInRequired({
  isDM, onToggleNav, onCloseNav, user, profile, onSignIn, onSignOut, onProfileUpdate,
  breadcrumb, message,
}) {
  return (
    <div className="mc-app">
      <div className="scrim" onClick={onCloseNav} />
      <Sidebar isDM={isDM} onCloseNav={onCloseNav} user={user} profile={profile} onSignIn={onSignIn} onSignOut={onSignOut} onProfileUpdate={onProfileUpdate} />
      <div className="mc-main">
        <div className="mc-topbar">
          <div className="mc-crumb">
            <button className="hamburger btn sm icon" onClick={onToggleNav} dangerouslySetInnerHTML={{ __html: MENU_SVG }} />
            <span><Link to="/">Home</Link> › <b>{breadcrumb}</b></span>
          </div>
        </div>
        <div className="mc-empty">
          <div dangerouslySetInnerHTML={{ __html: USER_SVG }} />
          <p>{message}</p>
          <button className="btn primary" onClick={onSignIn}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
