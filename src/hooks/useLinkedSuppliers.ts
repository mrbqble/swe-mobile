import { useEffect, useState } from 'react';
import * as api from '../api/linkedSuppliers.mock';
import { LinkedSupplier } from '../api/linkedSuppliers.mock';
import { emitter } from '../helpers/events';

export function useLinkedSuppliers(consumerId?: string | number) {
  const [suppliers, setSuppliers] = useState<LinkedSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.fetchLinkedSuppliers(consumerId);
        if (mounted) setSuppliers(res || []);
      } catch (err) {
        if (mounted) setError(err);
      } finally { if (mounted) setLoading(false); }
    })();
    let unsub = () => {};
    if (typeof emitter !== 'undefined' && typeof emitter.on === 'function') {
      unsub = emitter.on('linkedSuppliersChanged', async () => {
        try {
          const res = await api.fetchLinkedSuppliers(consumerId);
          if (mounted) setSuppliers(res || []);
        } catch (e) { /* ignore */ }
      });
    }
    return () => { try { unsub(); } catch (e) {} mounted = false; };
  }, [consumerId]);

  return { suppliers, loading, error, refresh: async () => { setLoading(true); try { const res = await api.fetchLinkedSuppliers(consumerId); setSuppliers(res || []); } finally { setLoading(false); } } };
}
