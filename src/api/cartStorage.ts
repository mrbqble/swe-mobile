import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'APP_CART';

export type CartItem = {
  productId: number | string;
  qty: number;
};

export type CartData = {
  items: CartItem[];
};

/**
 * Get cart from AsyncStorage
 */
export async function getCart(): Promise<CartData> {
  try {
    const cartJson = await AsyncStorage.getItem(CART_KEY);
    if (cartJson) {
      const cart = JSON.parse(cartJson) as CartData;
      return cart;
    }
  } catch (error) {
    console.error('Error reading cart from storage:', error);
  }
  return { items: [] };
}

/**
 * Save cart to AsyncStorage
 */
export async function saveCart(cart: CartData): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
    throw error;
  }
}

/**
 * Clear cart from AsyncStorage
 */
export async function clearCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (error) {
    console.error('Error clearing cart from storage:', error);
    throw error;
  }
}

/**
 * Add item to cart or update quantity if exists
 */
export async function addToCart(productId: number | string, qty: number = 1): Promise<CartData> {
  const cart = await getCart();
  const existingIndex = cart.items.findIndex(item => String(item.productId) === String(productId));

  if (existingIndex >= 0) {
    // Update existing item quantity
    cart.items[existingIndex].qty += qty;
  } else {
    // Add new item
    cart.items.push({ productId, qty });
  }

  await saveCart(cart);
  return cart;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(productId: number | string): Promise<CartData> {
  const cart = await getCart();
  cart.items = cart.items.filter(item => String(item.productId) !== String(productId));
  await saveCart(cart);
  return cart;
}

/**
 * Update item quantity in cart
 */
export async function updateCartItem(productId: number | string, qty: number): Promise<CartData> {
  if (qty <= 0) {
    return removeFromCart(productId);
  }

  const cart = await getCart();
  const existingIndex = cart.items.findIndex(item => String(item.productId) === String(productId));

  if (existingIndex >= 0) {
    cart.items[existingIndex].qty = qty;
  } else {
    cart.items.push({ productId, qty });
  }

  await saveCart(cart);
  return cart;
}

/**
 * Calculate total quantity of items in cart
 */
export function calculateTotalQty(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.qty || 0), 0);
}

