import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LocationsPage from './pages/LocationsPage';
import CharactersPage from './pages/CharactersPage';
import QuestsPage from './pages/QuestsPage';
import TimelinePage from './pages/TimelinePage';
import MyCharacterPage from './pages/MyCharacterPage';
import MyNotesPage from './pages/MyNotesPage';
import LootPage from './pages/LootPage';
import ActivityPage from './pages/ActivityPage';
import SignInModal from './components/SignInModal';
import GlobalSearch from './components/GlobalSearch';
import { useAuth } from './hooks/useAuth';
import './styles/tome.css';

function App() {
  const { user, profile, signIn, signOut, updateProfile } = useAuth();
  const [isDM, setIsDM] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    const dm = profile?.role === 'dm';
    setIsDM(dm);
    document.body.classList.toggle('dm', dm);
  }, [profile]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', navOpen);
  }, [navOpen]);

  const authProps = {
    user,
    profile,
    onSignIn: () => setShowSignIn(true),
    onSignOut: signOut,
    onProfileUpdate: updateProfile,
  };

  const sharedProps = {
    ...authProps,
    isDM,
    onToggleDM: () => setIsDM(d => !d),
    onToggleNav: () => setNavOpen(n => !n),
    onCloseNav: () => setNavOpen(false),
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage {...sharedProps} />} />
        <Route path="/locations" element={<LocationsPage {...sharedProps} />} />
        <Route path="/characters" element={<CharactersPage {...sharedProps} />} />
        <Route path="/quests" element={<QuestsPage {...sharedProps} />} />
        <Route path="/timeline" element={<TimelinePage {...sharedProps} />} />
        <Route path="/my-character" element={<MyCharacterPage {...sharedProps} />} />
        <Route path="/my-notes" element={<MyNotesPage {...sharedProps} />} />
        <Route path="/loot" element={<LootPage {...sharedProps} />} />
        <Route path="/activity" element={<ActivityPage {...sharedProps} />} />
      </Routes>
      {showSignIn && (
        <SignInModal
          onSignIn={signIn}
          onClose={() => setShowSignIn(false)}
        />
      )}
      <GlobalSearch isDM={isDM} user={user} profile={profile} />
    </>
  );
}

export default App;
