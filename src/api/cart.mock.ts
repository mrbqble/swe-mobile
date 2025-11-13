import { Product } from '../helpers/types';

type CartItem = { productId: number | string; qty: number; product?: Product };

let cart: CartItem[] = [];

export async function getCart(): Promise<{ items: CartItem[]; totalQty: number }> {
  const totalQty = cart.reduce((s, it) => s + it.qty, 0);
  return { items: cart, totalQty };
}

export async function addToCart(productId: number | string, qty = 1): Promise<void> {
  const idx = cart.findIndex(c => String(c.productId) === String(productId));
  if (idx >= 0) cart[idx].qty += qty;
  else cart.push({ productId, qty });
}

export async function removeFromCart(productId: number | string): Promise<void> {
  cart = cart.filter(c => String(c.productId) !== String(productId));
}

export async function updateCartItem(productId: number | string, qty: number): Promise<void> {
  if (qty <= 0) {
    cart = cart.filter(c => String(c.productId) !== String(productId));
    return;
  }
  const idx = cart.findIndex(c => String(c.productId) === String(productId));
  if (idx >= 0) cart[idx].qty = qty;
  else cart.push({ productId, qty });
}

export async function clearCart(): Promise<void> {
  cart = [];
}
