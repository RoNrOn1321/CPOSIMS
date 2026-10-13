import { useState, useMemo } from 'react';

export interface CartItem {
  product: {
    id: number;
    name?: string;
    price: number;
    image?: string;
    category?: string;
    stock_quantity?: number;
    [key: string]: any;
  };
  quantity: number;
}

export interface CheckoutCartItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
}

/**
 * Format cart items into the shape strictly required by PosCheckoutRequest
 * (product_id, quantity, unit_price).
 */
export function formatCartForCheckout(
  cartItems: Array<{ product: { id: number | string; price: number | string }; quantity: number }>
): CheckoutCartItemPayload[] {
  return cartItems.map((item) => ({
    product_id: Number(item.product.id),
    quantity: Number(item.quantity),
    unit_price: Number(item.product.price),
  }));
}

export function usePOSCart(dailyLimit?: number) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: any, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const exceedsLimit = useMemo(() => {
    return dailyLimit ? subtotal > dailyLimit : false;
  }, [subtotal, dailyLimit]);

  const getCheckoutItems = (): CheckoutCartItemPayload[] => {
    return formatCartForCheckout(items);
  };

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    exceedsLimit,
    getCheckoutItems,
    formatForCheckout: getCheckoutItems,
  };
}
