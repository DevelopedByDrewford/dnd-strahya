import { useEffect, useState } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';
const HEARTBEAT_MS = 60_000;
const STALE_MS = 3 * 60_000;

export function useAllUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    return onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    });
  }, []);
  return users;
}

export function useAllPresence() {
  const [presence, setPresence] = useState([]);
  useEffect(() => {
    return onSnapshot(collection(db, 'campaigns', CAMPAIGN_ID, 'presence'), snap => {
      setPresence(snap.docs.map(d => d.data()));
    });
  }, []);
  return presence;
}

// Call at app root to register heartbeat while logged in.
export function usePresenceWriter({ user, profile }) {
  useEffect(() => {
    if (!user || !profile) return;
    const ref = doc(db, 'campaigns', CAMPAIGN_ID, 'presence', user.uid);
    const beat = () => setDoc(ref, {
      uid: user.uid,
      displayName: profile.displayName || user.email?.split('@')[0] || '?',
      lastSeen: serverTimestamp(),
    });

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    const cleanup = () => deleteDoc(ref).catch(() => {});
    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', cleanup);
      deleteDoc(ref).catch(() => {});
    };
  }, [user, profile]);
}

// Call wherever you need the live presence list.
export function usePresenceList({ userId } = {}) {
  const [presenceList, setPresenceList] = useState([]);

  useEffect(() => {
    const ref = collection(db, 'campaigns', CAMPAIGN_ID, 'presence');
    return onSnapshot(ref, snap => {
      const cutoff = Date.now() - STALE_MS;
      setPresenceList(
        snap.docs
          .map(d => d.data())
          .filter(p => p.lastSeen?.toMillis?.() > cutoff)
          .sort((a, b) => {
            if (a.uid === userId) return -1;
            if (b.uid === userId) return 1;
            return (a.displayName || '').localeCompare(b.displayName || '');
          })
      );
    });
  }, [userId]);

  return presenceList;
}
