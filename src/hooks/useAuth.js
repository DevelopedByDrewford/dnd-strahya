import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setProfile(null);
        return;
      }
      setUser(fbUser);
      const ref = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        const defaultProfile = {
          displayName: fbUser.email.split('@')[0],
          avatarUrl: null,
          role: 'player',
        };
        await setDoc(ref, defaultProfile);
        setProfile(defaultProfile);
      }
    });
  }, []);

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signOut = () => fbSignOut(auth);

  const updateProfile = (updates) =>
    setProfile(prev => ({ ...prev, ...updates }));

  return { user, profile, signIn, signOut, updateProfile };
}
