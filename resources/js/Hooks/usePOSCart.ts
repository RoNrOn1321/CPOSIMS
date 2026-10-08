import { useState, useMemo } from 'react';

export interface CartItem {
  product: any;
  quantity: number;
}

export function usePOSCart(dailyLimit?: number) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: any, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [items]);

  const exceedsLimit = useMemo(() => {
    return dailyLimit ? subtotal > dailyLimit : false;
  }, [subtotal, dailyLimit]);

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    exceedsLimit
  };
}
