import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

export function useNotes(entityId, { isDM = false, userId = null } = {}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId || !userId) { setLoading(false); return; }

    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'notes');
    const scopes = isDM ? ['pub', 'priv', 'dm'] : ['pub', 'priv'];
    const q = query(col,
      where('entityId', '==', entityId),
      where('scope', 'in', scopes),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(q,
      snap => { setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false),
    );
  }, [entityId, isDM, userId]);

  const col = () => collection(db, 'campaigns', CAMPAIGN_ID, 'notes');

  async function addNote({ scope, body, who, entityType, entityName }) {
    if (!entityId) throw new Error('entityId must be defined before adding a note');
    return addDoc(col(), {
      entityId, entityType, entityName,
      scope, body, who, authorId: userId,
      createdAt: serverTimestamp(),
    });
  }

  async function updateNote(id, body) {
    return updateDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'notes', id), { body, updatedAt: serverTimestamp() });
  }

  async function deleteNote(id) {
    return deleteDoc(doc(db, 'campaigns', CAMPAIGN_ID, 'notes', id));
  }

  return { notes, loading, addNote, updateNote, deleteNote };
}
