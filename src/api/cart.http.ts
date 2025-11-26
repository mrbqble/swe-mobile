import * as cartStorage from './cartStorage';

/**
 * Get cart from local storage
 * Returns cart data with items array, totalQty, and items grouped by supplier
 */
export async function getCart() {
  const cart = await cartStorage.getCart();
  const totalQty = cartStorage.calculateTotalQty(cart.items);
  const bySupplier = cartStorage.groupBySupplier(cart.items);
  return {
    items: cart.items,
    totalQty,
    bySupplier
  };
}

/**
 * Add item to cart or update quantity if exists
 * Requires supplierId to group items by supplier
 */
export async function addToCart(productId: number | string, qty: number = 1, supplierId?: number | string) {
  const cart = await cartStorage.addToCart(productId, qty, supplierId);
  const totalQty = cartStorage.calculateTotalQty(cart.items);
  const bySupplier = cartStorage.groupBySupplier(cart.items);
  return {
    items: cart.items,
    totalQty,
    bySupplier
  };
}

/**
 * Remove item from cart
 */
export async function removeFromCart(productId: number | string) {
  const cart = await cartStorage.removeFromCart(productId);
  const totalQty = cartStorage.calculateTotalQty(cart.items);
  return {
    items: cart.items,
    totalQty
  };
}

/**
 * Clear all items from cart
 */
export async function clearCart() {
  await cartStorage.clearCart();
  return {
    items: [],
    totalQty: 0
  };
}

/**
 * Update item quantity in cart
 */
export async function updateCartItem(productId: number | string, qty: number, supplierId?: number | string) {
  const cart = await cartStorage.updateCartItem(productId, qty, supplierId);
  const totalQty = cartStorage.calculateTotalQty(cart.items);
  const bySupplier = cartStorage.groupBySupplier(cart.items);
  return {
    items: cart.items,
    totalQty,
    bySupplier
  };
}

export default { getCart, addToCart, removeFromCart, clearCart, updateCartItem };
