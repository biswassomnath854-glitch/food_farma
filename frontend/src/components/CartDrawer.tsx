import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Your Cart</h2>
                <p className="text-xs text-slate-400">
                  {items.length} item(s) selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEmpty && (
                <button
                  onClick={clearCart}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors text-xs font-semibold flex items-center gap-1"
                  title="Clear all items"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Your Cart is Empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Looks like you haven't added anything to your cart yet. Explore our delicious menu!
                </p>
              </div>
            ) : (
              items.map((item) => {
                const food = item.food;
                if (!food) return null;
                const itemPrice = food.discountPrice || food.price;
                const totalItemPrice = itemPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {food.name}
                      </h4>
                      <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                        ₹{itemPrice} x {item.quantity} = ₹{totalItemPrice}
                      </p>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-orange-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="text-xs font-extrabold px-1">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bill Details & Checkout */}
          {!isEmpty && cart && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
              
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">₹{cart.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">₹{cart.deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Restaurant Charges (5%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">₹{cart.tax}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-black text-slate-900 dark:text-slate-100">
                  <span>To Pay</span>
                  <span className="text-orange-600 dark:text-orange-400 text-base">₹{cart.totalAmount}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Safe Payment & Contactless Delivery</span>
              </div>

              {isAdmin ? (
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 space-y-1.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Mode Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Administrators manage orders and cannot purchase items. Please log in with a customer account to place orders.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    closeCart();
                    onProceedToCheckout();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
