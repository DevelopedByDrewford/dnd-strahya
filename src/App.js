import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LocationsPage from './components/LocationsPage';
import CharactersPage from './components/CharactersPage';
import './styles/tome.css';

function App() {
  const [isDM, setIsDM] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dm', isDM);
  }, [isDM]);

  useEffect(() => {
    document.body.classList.toggle('nav-open', navOpen);
  }, [navOpen]);

  const sharedProps = {
    isDM,
    onToggleDM: () => setIsDM(d => !d),
    onToggleNav: () => setNavOpen(n => !n),
    onCloseNav: () => setNavOpen(false),
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage {...sharedProps} />} />
      <Route path="/locations" element={<LocationsPage {...sharedProps} />} />
      <Route path="/characters" element={<CharactersPage {...sharedProps} />} />
    </Routes>
  );
}

export default App;
