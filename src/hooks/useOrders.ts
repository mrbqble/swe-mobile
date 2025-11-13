import { useEffect, useState } from 'react';
import * as ordersApi from '../api/orders.mock';
import { Order } from '../api/orders.mock';

export function useOrders(consumerId?: string | number) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await ordersApi.fetchOrdersForConsumer(consumerId);
        if (mounted) setOrders(res || []);
      } catch (err) {
        if (mounted) setError(err);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [consumerId]);

  return { orders, loading, error, refresh: async () => {
    setLoading(true);
    try { const res = await ordersApi.fetchOrdersForConsumer(consumerId); setOrders(res || []); }
    finally { setLoading(false); }
  } };
}
