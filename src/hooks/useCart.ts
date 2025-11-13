import { useEffect, useState } from 'react';
import { cart } from '../api';

export function useCart() {
  const [items, setItems] = useState<any[]>([]);
  const [totalQty, setTotalQty] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await (cart as any).getCart();
      setItems(res.items || []);
      setTotalQty(res.totalQty || 0);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const add = async (productId: number | string, qty = 1) => {
    await (cart as any).addToCart(productId, qty);
    await load();
  };

  const remove = async (productId: number | string) => {
    await (cart as any).removeFromCart(productId);
    await load();
  };

  const update = async (productId: number | string, qty: number) => {
    if ((cart as any).updateCartItem) {
      await (cart as any).updateCartItem(productId, qty);
    } else {
      // fallback: if qty <=0 remove, else set by removing and adding
      if (qty <= 0) await (cart as any).removeFromCart(productId);
      else {
        await (cart as any).removeFromCart(productId);
        await (cart as any).addToCart(productId, qty);
      }
    }
    await load();
  };

  const clear = async () => {
    await (cart as any).clearCart();
    await load();
  };

  return { items, totalQty, loading, load, add, remove, clear, update };
}
