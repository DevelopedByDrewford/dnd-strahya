import { useState, useEffect } from 'react';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { TIMELINE as SEED_DATA } from '../data/timeline';

export function useTimeline(campaignId, { isDM = false } = {}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!campaignId) { setLoading(false); return; }

    const col = collection(db, 'campaigns', campaignId, 'timeline');
    const q = isDM
      ? col
      : query(col, where('hidden', '==', false));

    let active = true;
    const unsub = onSnapshot(
      q,
      snap => {
        if (!active) return;
        const es = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        es.sort((a, b) => (b.order || 0) - (a.order || 0));
        setEntries(es);
        setLoading(false);
      },
      err => {
        if (!active) return;
        setLoading(false);
        setError(err);
      },
    );
    return () => { active = false; unsub(); };
  }, [campaignId, isDM]);

  async function addEntry(data) {
    const col = collection(db, 'campaigns', campaignId, 'timeline');
    return addDoc(col, {
      hidden: false,
      ...data,
      order: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateEntry(id, data) {
    const ref = doc(db, 'campaigns', campaignId, 'timeline', id);
    return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  }

  async function deleteEntry(id) {
    const ref = doc(db, 'campaigns', campaignId, 'timeline', id);
    return deleteDoc(ref);
  }

  async function seedEntries() {
    const col = collection(db, 'campaigns', campaignId, 'timeline');
    const batch = writeBatch(db);
    SEED_DATA.forEach((entry, i) => {
      const { id, ...data } = entry;
      batch.set(doc(col, id), { ...data, order: SEED_DATA.length - i }, { merge: true });
    });
    return batch.commit();
  }

  const visible = isDM ? entries : entries.filter(e => !e.hidden);

  return { entries, visible, loading, error, addEntry, updateEntry, deleteEntry, seedEntries };
}
