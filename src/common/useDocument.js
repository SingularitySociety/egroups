import { useState, useEffect } from 'react';

// This function asynchronously fetches a Firestore document specified by the path and returns it. 
// It returns null if the path is null or the document does not exist. 
function useDocument(db, path) {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{
    if (path) {
      const ref = db.doc(path);
      async function fetchDocument() {
        try {
          const snapshot = await ref.get();
          setDocument(snapshot.data());
        } catch(e) {
          console.log(e);
          setError(e);
        }
      }
      fetchDocument();
    } else {
      setDocument(null);
    }
  }, [db, path]);

  return [document, error];
}

export default useDocument;