import { useEffect, useRef, useState } from 'react';
import { Product } from '../helpers/types';
import { catalog } from '../api';

export function useCatalog(initialQuery = '', pageSize = 20, supplierId?: number | string) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const queryRef = useRef(query);

  // debounce query changes
  useEffect(() => {
    const id = setTimeout(() => {
      queryRef.current = query;
      load(1);
    }, 300);
    return () => clearTimeout(id);
  }, [query, supplierId]);

  async function load(nextPage = 1) {
    setLoading(true);
    setError(null);
    try {
        // pass supplierId to catalog adapter if present
        const resp = await (catalog as any).fetchCatalog({ supplier_id: supplierId, page: nextPage, size: pageSize, search: queryRef.current });
        if (nextPage === 1) setItems(resp.data || []);
        else setItems(prev => [...prev, ...(resp.data || [])]);
        setPage(nextPage);
        setHasMore(nextPage < (resp.meta?.pages ?? 1));
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const loadMore = async () => {
    if (loading || !hasMore) return;
    await load(page + 1);
  };

  const refresh = async () => {
    await load(1);
  };

  // initial load
  useEffect(() => { load(1); }, []);

  return { items, query, setQuery, loading, error, hasMore, loadMore, refresh };
}
