import { useState, useEffect } from 'react';
import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { LOOT } from '../data/quests';

const STATIC_ITEMS = LOOT.map((it, i) => ({
  id: `static-${i}`,
  name: it.name,
  subtitle: it.sub,
  icon: it.i,
  foundAt: it.found,
  quantity: 1,
  value: it.val,
  claimBy: it.claimOpen ? null : it.claim,
  claimOpen: it.claimOpen,
  recordVisibility: 'public',
  dmTrue: it.dmTrue || null,
  _static: true,
}));

function parseGp(value) {
  if (!value || typeof value !== 'string') return 0;
  const m = value.replace(/,/g, '').match(/^(\d+(?:\.\d+)?)\s*gp$/i);
  return m ? parseFloat(m[1]) : 0;
}

export function useLoot(campaignId, { isDM = false, userId = 'Tessa' } = {}) {
  const [items, setItems] = useState(STATIC_ITEMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!campaignId) { setLoading(false); return; }

    const col = collection(db, 'campaigns', campaignId, 'loot');
    const q = isDM
      ? col
      : query(col, where('recordVisibility', '==', 'public'));

    let active = true;
    const unsub = onSnapshot(
      q,
      snap => {
        if (!active) return;
        if (!snap.empty) {
          const loot = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          loot.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
          setItems(loot);
        }
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

  const totalGp = items.reduce((sum, it) => sum + parseGp(it.value), 0);

  async function addItem({ dmNote, ...data }) {
    const col = collection(db, 'campaigns', campaignId, 'loot');
    const ref = await addDoc(col, {
      ...data,
      claimBy: null,
      claimOpen: true,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (dmNote && isDM) {
      await setDoc(doc(db, 'campaigns', campaignId, 'lootDm', ref.id), {
        trueIdentity: dmNote,
        updatedAt: serverTimestamp(),
      });
    }
    return ref;
  }

  async function claimItem(id, by) {
    const ref = doc(db, 'campaigns', campaignId, 'loot', id);
    return updateDoc(ref, { claimBy: by || null, claimOpen: !by, updatedAt: serverTimestamp() });
  }

  async function updateItem(id, data) {
    const ref = doc(db, 'campaigns', campaignId, 'loot', id);
    return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  }

  async function deleteItem(id) {
    await deleteDoc(doc(db, 'campaigns', campaignId, 'loot', id));
    await deleteDoc(doc(db, 'campaigns', campaignId, 'lootDm', id)).catch(() => {});
  }

  return { items, loading, error, totalGp, addItem, claimItem, updateItem, deleteItem };
}
