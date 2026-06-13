import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const CAMPAIGN_ID = process.env.REACT_APP_CAMPAIGN_ID || 'cos';

export function useActivity({ isDM = false, userId = null, max = 40 } = {}) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, 'campaigns', CAMPAIGN_ID, 'notes');
    const scopes = userId
      ? (isDM ? ['pub', 'priv', 'dm'] : ['pub', 'priv'])
      : ['pub'];
    const q = query(col, where('scope', 'in', scopes), orderBy('createdAt', 'desc'), limit(max));

    return onSnapshot(q,
      snap => { setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      err => { console.error('[useActivity]', err); setLoading(false); },
    );
  }, [isDM, userId, max]);

  return { activity, loading };
}
