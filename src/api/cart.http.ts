const BASE = 'http://YOUR_API_BASE_HERE';

export async function getCart() {
  const res = await fetch(`${BASE}/api/cart`);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function addToCart(productId: number | string, qty = 1) {
  const res = await fetch(`${BASE}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty })
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function removeFromCart(productId: number | string) {
  const res = await fetch(`${BASE}/api/cart/${productId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function clearCart() {
  const res = await fetch(`${BASE}/api/cart`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function updateCartItem(productId: number | string, qty: number) {
  const res = await fetch(`${BASE}/api/cart/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qty })
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}
