import { useState, useEffect } from 'react';

// This function asynchronously fetches a Firestore document specified by the path and returns it. 
// It returns null the document does not exist.
// It returns undefined if the path is null or undefined.
// WARNING: queryFilter must be a static function, not a callback function. 
// Otherwise, it will be called infinitly.
function useOnCollection(db, path, option) {
  const [collection, setCollection] = useState([]);
  const [error, setError] = useState(null);

  useEffect(()=>{
    let detacher = null;
    if (option && option.empty) {
      setCollection([]);
    } else if (path) {
      try {
        let ref = db.collection(path);
        if (option && option.queryFilter) {
          ref = option.queryFilter(ref); // optional query filters
        }
        detacher = ref.onSnapshot((snapshot)=>{
          const list = [];
          snapshot.forEach((doc)=>{
            const data = doc.data();
            data.id = doc.id;
            if (option && option.responseFilter) {
              list.push(option.responseFilter(data));
            } else {
              list.push(data);
            }
          });
          setCollection(list);
        }, (err) => {
          console.log("err 1", err);
          setCollection([]);
          setError(err);
        });
      } catch(err) {
        console.log("err 2", err);
        setError(err);
      }
    } else {
      setCollection([]);
    }
    return detacher;
  }, [db, path, option]);

  return [collection, error];
}

export default useOnCollection;
