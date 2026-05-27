import { useState, useEffect } from 'react';

// Custom hook — fetch with loading/error/fallback
export function useAPI(fetchFn, fallback, deps = []) {
  const [data,    setData]    = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFn()
      .then(d => { if (!cancelled) { setData(d); setError(null); } })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error };
}
