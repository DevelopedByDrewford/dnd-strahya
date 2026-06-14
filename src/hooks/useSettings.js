import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

export const SETTINGS_DEFAULTS = {
  title: 'Curse of Strahd',
  subtitle: 'The Tome',
  homeTitle: 'The Land of Barovia',
  homeSubtitle: 'The Mists Do Not Lift.',
  timelineTitle: 'The Chronicle of Barovia',
  timelineSubtitle: 'The Story So Far',
  lootTitle: 'Shared between the party',
  lootSubtitle: 'The Pile',
};

export function useSettings() {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);

  useEffect(() => {
    const ref = doc(db, 'campaigns', CAMPAIGN_ID, 'settings', 'main');
    return onSnapshot(ref, snap => {
      if (snap.exists()) setSettings({ ...SETTINGS_DEFAULTS, ...snap.data() });
    });
  }, []);

  async function updateSettings(updates) {
    const ref = doc(db, 'campaigns', CAMPAIGN_ID, 'settings', 'main');
    await setDoc(ref, updates, { merge: true });
  }

  return { settings, updateSettings };
}
