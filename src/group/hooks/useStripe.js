import { useState, useEffect } from 'react';

function useStripe(db, groupId, userId) {
  const [stripe, setStripe] = useState(null);

  useEffect(()=>{
    if (userId) {
      const ref = db.doc(`/groups/${groupId}/members/${userId}/private/stripe`);
      async function fetchStripe() {
        const snapshot = await ref.get();
        setStripe(snapshot.data());
      }
      fetchStripe();
    }
  }, [db, groupId, userId]);

  return stripe;
}

export default useStripe;