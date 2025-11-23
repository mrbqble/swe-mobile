import * as cartStorage from './cartStorage';

/**
 * Get cart from local storage
 * Returns cart data with items array and totalQty
 */
export async function getCart() {
  const cart = await cartStorage.getCart();
  const totalQty = cartStorage.calculateTotalQty(cart.items);
  return {
    items: cart.items,
    totalQty
  };
}

/**
 * Add item to cart or update quantity if exists
 */
export async function addToCart(productId: number | string, qty: number = 1) {
  const cart = await cartStorage.addToCart(productId, qty);
  const totalQty = cartStorage.calculateTotalQty(cart.items);
  return {
    items: cart.items,
    totalQty
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
export async function updateCartItem(productId: number | string, qty: number) {
  const cart = await cartStorage.updateCartItem(productId, qty);
  const totalQty = cartStorage.calculateTotalQty(cart.items);
  return {
    items: cart.items,
    totalQty
  };
}

export default { getCart, addToCart, removeFromCart, clearCart, updateCartItem };
