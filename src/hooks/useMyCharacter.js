import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

export function useMyCharacter(userId) {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const ref = doc(db, 'campaigns', CAMPAIGN_ID, 'characters', userId);
    return onSnapshot(
      ref,
      snap => { setCharacter(snap.exists() ? { id: snap.id, ...snap.data() } : null); setLoading(false); },
      () => setLoading(false),
    );
  }, [userId]);

  async function saveCharacter(data) {
    const ref = doc(db, 'campaigns', CAMPAIGN_ID, 'characters', userId);
    await setDoc(ref, {
      ...data,
      group: 'The Party',
      userId,
      visibility: 'players',
      dot: 'good',
      sortOrder: -100,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  async function deleteCharacter() {
    await deleteDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'characters', userId));
  }

  return { character, loading, saveCharacter, deleteCharacter };
}
