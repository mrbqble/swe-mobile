import { useEffect, useState } from 'react';
import { Product } from '../helpers/types';
import { product } from '../api';

export function useProduct(id?: number | string) {
  const [item, setItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id == null) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await (product as any).fetchProduct(id);
        if (mounted) setItem(res as Product | null);
      } catch (err: any) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  return { item, loading, error };
}
