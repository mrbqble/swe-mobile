import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'APP_CART';

export type CartItem = {
  productId: number | string;
  qty: number;
  supplierId?: number | string; // Track supplier for each item
};

export type CartData = {
  items: CartItem[];
  // Grouped by supplier for easier access
  bySupplier?: Record<string, CartItem[]>;
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
 * Requires supplierId to group items by supplier
 */
export async function addToCart(productId: number | string, qty: number = 1, supplierId?: number | string): Promise<CartData> {
  const cart = await getCart();
  const existingIndex = cart.items.findIndex(item => String(item.productId) === String(productId));

  if (existingIndex >= 0) {
    // Update existing item quantity
    cart.items[existingIndex].qty += qty;
    // Update supplierId if provided and different
    if (supplierId && cart.items[existingIndex].supplierId !== supplierId) {
      // If supplier changes, remove old item and add as new (different supplier = different order)
      cart.items.splice(existingIndex, 1);
      cart.items.push({ productId, qty, supplierId });
    } else if (supplierId) {
      cart.items[existingIndex].supplierId = supplierId;
    }
  } else {
    // Add new item with supplierId
    cart.items.push({ productId, qty, supplierId });
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
export async function updateCartItem(productId: number | string, qty: number, supplierId?: number | string): Promise<CartData> {
  if (qty <= 0) {
    return removeFromCart(productId);
  }

  const cart = await getCart();
  const existingIndex = cart.items.findIndex(item => String(item.productId) === String(productId));

  if (existingIndex >= 0) {
    cart.items[existingIndex].qty = qty;
    if (supplierId) {
      cart.items[existingIndex].supplierId = supplierId;
    }
  } else {
    cart.items.push({ productId, qty, supplierId });
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

/**
 * Group cart items by supplier
 */
export function groupBySupplier(items: CartItem[]): Record<string, CartItem[]> {
  const grouped: Record<string, CartItem[]> = {};
  items.forEach(item => {
    const supplierKey = String(item.supplierId || 'unknown');
    if (!grouped[supplierKey]) {
      grouped[supplierKey] = [];
    }
    grouped[supplierKey].push(item);
  });
  return grouped;
}

