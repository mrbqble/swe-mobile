import { useEffect, useState } from 'react';
import { orders as ordersApi } from '../api';

export function useOrders(consumerId?: string | number) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await (ordersApi as any).fetchOrdersForConsumer
          ? await (ordersApi as any).fetchOrdersForConsumer(consumerId)
          : await (ordersApi as any).listOrders({});
        // some adapters return paginated responses, extract items if present
        const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : res?.data || [];
        if (mounted) setOrders(items || []);
      } catch (err) {
        if (mounted) setError(err);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [consumerId]);

  return { orders, loading, error, refresh: async () => {
    setLoading(true);
    try {
      const res = await (ordersApi as any).fetchOrdersForConsumer
        ? await (ordersApi as any).fetchOrdersForConsumer(consumerId)
        : await (ordersApi as any).listOrders({});
      const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : res?.data || [];
      setOrders(items || []);
    } finally { setLoading(false); }
  } };
}
