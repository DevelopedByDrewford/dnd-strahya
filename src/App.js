import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
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

  return (
    <HomePage
      isDM={isDM}
      onToggleDM={() => setIsDM(d => !d)}
      onToggleNav={() => setNavOpen(n => !n)}
      onCloseNav={() => setNavOpen(false)}
    />
  );
}

export default App;
