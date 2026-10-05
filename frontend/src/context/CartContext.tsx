import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartType } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartType | null;
  loading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (foodId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res: any = await apiClient.get('/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = async (foodId: string, quantity = 1) => {
    if (!user) {
      showToast('Please login to add items to cart', 'info');
      return;
    }
    if (user.role === 'ADMIN') {
      showToast('Admins cannot purchase items. Please log in with a customer account to order.', 'warning');
      return;
    }
    try {
      const res: any = await apiClient.post('/cart/items', { foodId, quantity });
      if (res.success) {
        showToast('Item added to cart!', 'success');
        await refreshCart();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add item to cart', 'error');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res: any = await apiClient.put(`/cart/items/${itemId}`, { quantity });
      if (res.success) {
        await refreshCart();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res: any = await apiClient.delete(`/cart/items/${itemId}`);
      if (res.success) {
        showToast('Item removed from cart', 'info');
        await refreshCart();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      const res: any = await apiClient.delete('/cart');
      if (res.success) {
        setCart((prev) => (prev ? { ...prev, items: [], subtotal: 0, tax: 0, totalAmount: 0 } : null));
      }
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
