import { useEffect, useState } from 'react';
import { suppliers as api } from '../api';
import { Supplier } from '../helpers/types';

export function useSupplierSearch(query: string) {
  const [results, setResults] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.searchSuppliers(query);
        if (mounted) setResults(res || []);
      } catch (err) {
        if (mounted) setResults([]);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [query]);

  return { results, loading };
}
