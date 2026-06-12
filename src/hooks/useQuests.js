import { useState, useEffect, useMemo } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { QUESTS_INITIAL } from '../data/quests';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

export function useQuests() {
  const [firestoreQuests, setFirestoreQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'quests');
    const q = query(col, orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q,
      snap => {
        setFirestoreQuests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => { setLoading(false); setError(err); },
    );
    return unsub;
  }, []);

  const quests = useMemo(() => [
    ...QUESTS_INITIAL,
    ...firestoreQuests.map(q => ({
      id: q.id,
      name: q.name,
      status: q.status || 'active',
      by: q.by || '—',
      byYou: false,
      giver: q.giver || '—',
      location: q.location || '—',
      deadline: q.deadline || null,
      deadlineState: q.deadlineState || null,
      desc: q.desc || '',
      subs: q.subs || [],
      rewards: q.rewards || [],
      links: [],
      secret: q.secret || '',
      dm: q.visibility === 'hidden',
      firestore: true,
    })),
  ], [firestoreQuests]);

  async function addQuest(data) {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'quests');
    return addDoc(col, { ...data, createdAt: serverTimestamp() });
  }

  async function updateQuest(id, data) {
    return updateDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'quests', id), data);
  }

  async function deleteQuest(id) {
    return deleteDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'quests', id));
  }

  return { quests, loading, error, addQuest, updateQuest, deleteQuest };
}
