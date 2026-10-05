import React, { useState, useEffect } from 'react';
import type { AddressType } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import { X, MapPin, CreditCard, Banknote, Plus, CheckCircle2, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Address creation form state
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: 'Basirhat',
    state: 'West Bengal',
    pincode: '743411',
  });

  // Razorpay simulation modal state
  const [razorpayModalData, setRazorpayModalData] = useState<{
    orderId: string;
    razorpayOrderId: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      const res: any = await apiClient.get('/addresses');
      if (res.success && res.data) {
        setAddresses(res.data);
        const defaultAddr = res.data.find((a: AddressType) => a.isDefault) || res.data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowAddressForm(true);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await apiClient.post('/addresses', newAddress);
      if (res.success && res.data) {
        showToast('Delivery address saved!', 'success');
        setAddresses((prev) => [res.data, ...prev]);
        setSelectedAddressId(res.data.id);
        setShowAddressForm(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleVerifyRazorpayPayment = async (payload: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      setLoading(true);
      const res: any = await apiClient.post('/payments/verify', payload);
      if (res.success) {
        showToast('Razorpay Payment Verified & Successful!', 'success');
        await refreshCart();
        setRazorpayModalData(null);
        onClose();
        onOrderSuccess(payload.orderId);
      }
    } catch (err: any) {
      showToast(err.message || 'Payment verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (user?.role === 'ADMIN') {
      showToast('Administrators cannot place orders. Please use a customer account.', 'error');
      return;
    }
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }
    if (!cart || !cart.items || cart.items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    try {
      setLoading(true);
      const res: any = await apiClient.post('/orders', {
        addressId: selectedAddressId,
        paymentMethod,
        deliveryInstructions,
      });

      if (res.success && res.data) {
        const createdOrder = res.data;

        if (paymentMethod === 'ONLINE') {
          // Create Razorpay payment order
          const rzpRes: any = await apiClient.post('/payments/create-order', {
            orderId: createdOrder.id,
          });

          if (rzpRes.success) {
            const isLoaded = await loadRazorpayScript();
            if (isLoaded && (window as any).Razorpay) {
              const options = {
                key: rzpRes.data.keyId || 'rzp_test_TVs4txoK7Ntsai',
                amount: rzpRes.data.amount,
                currency: rzpRes.data.currency || 'INR',
                name: 'Eat N Bite Food Farma',
                description: `Order #${createdOrder.id.slice(0, 8)}`,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop',
                order_id: rzpRes.data.razorpayOrderId,
                handler: async function (response: any) {
                  await handleVerifyRazorpayPayment({
                    orderId: createdOrder.id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                },
                modal: {
                  ondismiss: function () {
                    showToast('Razorpay popup closed. You can complete or simulate below.', 'info');
                    setRazorpayModalData({
                      orderId: createdOrder.id,
                      razorpayOrderId: rzpRes.data.razorpayOrderId,
                      amount: createdOrder.totalAmount,
                    });
                  },
                },
                theme: {
                  color: '#f97316',
                },
              };

              const rzp = new (window as any).Razorpay(options);
              rzp.open();
            } else {
              setRazorpayModalData({
                orderId: createdOrder.id,
                razorpayOrderId: rzpRes.data.razorpayOrderId,
                amount: createdOrder.totalAmount,
              });
            }
          }
        } else {
          showToast('Order placed successfully (Cash on Delivery)!', 'success');
          await refreshCart();
          onClose();
          onOrderSuccess(createdOrder.id);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateRazorpayPayment = async () => {
    if (!razorpayModalData) return;
    await handleVerifyRazorpayPayment({
      orderId: razorpayModalData.orderId,
      razorpay_order_id: razorpayModalData.razorpayOrderId,
      razorpay_payment_id: `pay_simulated_${Date.now()}`,
      razorpay_signature: 'simulated_test_signature',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-slate-900 dark:text-slate-100 z-10 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black tracking-tight">Checkout & Order Placement</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select address and payment preference</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Razorpay Simulation Sub-Modal */}
        {razorpayModalData ? (
          <div className="py-8 space-y-6 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-lg">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Razorpay Gateway Simulator</span>
              <h3 className="text-2xl font-black mt-1">Paying ₹{razorpayModalData.amount}</h3>
              <p className="text-xs text-slate-400 mt-1">Order Ref: {razorpayModalData.razorpayOrderId}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant</span>
                <span className="font-bold">Eat N Bite Food Farma</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Modes</span>
                <span className="font-bold">UPI / Cards / NetBanking</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRazorpayModalData(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateRazorpayPayment}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Simulate Successful Payment</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            
            {/* Step 1: Select Delivery Address */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  1. Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressForm((prev) => !prev)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-500 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddressForm ? 'Cancel' : 'Add New'}</span>
                </button>
              </div>

              {showAddressForm ? (
                <form onSubmit={handleCreateAddress} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Address Line (House No, Street, Landmark)"
                    required
                    value={newAddress.addressLine}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
                  >
                    Save & Select Address
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 text-slate-900 dark:text-slate-100 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{addr.fullName}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {addr.addressLine}, {addr.city} - {addr.pincode}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Ph: {addr.phone}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                2. Payment Option
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 hover:border-orange-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs font-bold">Online Payment</p>
                    <p className="text-[10px] text-slate-400">Razorpay / UPI / Cards</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 hover:border-orange-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold">Cash on Delivery</p>
                    <p className="text-[10px] text-slate-400">Pay cash upon arrival</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 3: Delivery Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave package with security guard, don't ring bell..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            {/* Total Amount & Place Order Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Payable</span>
                <p className="text-xl font-black text-orange-600 dark:text-orange-400">
                  ₹{cart?.totalAmount || 0}
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{paymentMethod === 'ONLINE' ? 'Pay & Confirm Order' : 'Place COD Order'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
