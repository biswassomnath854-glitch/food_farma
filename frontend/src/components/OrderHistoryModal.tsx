import React, { useState, useEffect } from 'react';
import type { OrderType, OrderStatus } from '../types';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { ReceiptModal } from './ReceiptModal';
import {
  X,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Ban,
  Receipt,
  Star,
  MessageSquare,
  Sparkles,
  Loader2,
  Lock,
} from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusSteps: { key: OrderStatus; label: string }[] = [
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
  { key: 'OUT_FOR_DELIVERY', label: 'On The Way' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Receipt Modal state
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderType | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Feedback form state
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order: OrderType) => {
    const isPaid = order.paymentStatus === 'SUCCESS';
    const confirmMessage = isPaid
      ? `Are you sure you want to cancel order #${order.id.slice(0, 8)}? Since the order is in the "${order.status}" stage (before ready stage), an instant refund of ₹${order.totalAmount} will be refunded to your original payment method.`
      : `Are you sure you want to cancel order #${order.id.slice(0, 8)}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setCancellingId(order.id);
      const res: any = await apiClient.post(`/orders/${order.id}/cancel`, {
        reason: 'Customer requested cancellation/refund before ready stage',
      });
      if (res.success) {
        showToast(res.message || 'Order cancelled & refund processed successfully', 'success');
        await fetchOrders();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent, order: OrderType) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      const res: any = await apiClient.post('/reviews', {
        restaurantId: order.restaurantId,
        orderId: order.id,
        rating,
        comment,
      });

      if (res.success) {
        showToast('Thank you for your feedback & review!', 'success');
        setFeedbackOrderId(null);
        setComment('');
        await fetchOrders();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-slate-900 dark:text-slate-100 z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Your Order History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Track your orders, view receipts, refunds, and feedback</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              <span>Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <PackageCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Orders Found</h3>
              <p className="text-xs max-w-xs mx-auto mt-1">You haven't placed any food orders yet.</p>
            </div>
          ) : (
            orders.map((order) => {
              const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
              const isCancelled = order.status === 'CANCELLED';
              const isAccepted = ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
                order.status
              );
              const isRefundEligible = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status);
              const isPostReady = ['READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-2.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Order Header: Restaurant, ID, Date, Price & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {order.restaurant?.name || 'Eat N Bite Partner Restaurant'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400">
                          #{order.id.slice(0, 8)}
                        </span>
                        {!isCancelled && (
                          isRefundEligible ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              100% Refundable
                            </span>
                          ) : isPostReady ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3 text-amber-500" />
                              Refund Locked (Food Ready)
                            </span>
                          ) : null
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base font-black text-orange-600 dark:text-orange-400 mr-1">
                        ₹{order.totalAmount}
                      </span>

                      {/* Compact Receipt Button */}
                      <button
                        onClick={() => {
                          setSelectedReceiptOrder(order);
                          setShowReceiptModal(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200/80 dark:border-purple-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                        title="View official order receipt"
                      >
                        <Receipt className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Receipt</span>
                      </button>

                      {/* Cancel & Refund Button */}
                      {isRefundEligible && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          disabled={cancellingId === order.id}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                          title="Cancel order and claim instant refund before food is ready"
                        >
                          {cancellingId === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          <span>{order.paymentStatus === 'SUCCESS' ? 'Cancel & Refund' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cancelled & Refunded Banner */}
                  {isCancelled && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </span>
                        <span className="font-bold text-xs">
                          {order.paymentStatus === 'REFUNDED'
                            ? `Order Cancelled • ₹${order.refundAmount || order.totalAmount} 100% Refund Issued`
                            : 'Order Cancelled'}
                        </span>
                      </div>
                      {order.refundId && (
                        <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300">
                          Ref: #{order.refundId.slice(0, 16)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="py-1 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-1.5 flex justify-between items-center text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">
                          {item.quantity}× {item.foodName}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Sleek Live Status & Tracker Row */}
                  {!isCancelled && (
                    <div className="flex items-center justify-between gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : order.status === 'READY' || order.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          {statusSteps.find((s) => s.key === order.status)?.label || order.status}
                        </span>
                      </div>

                      {/* Stepper Dots Tracker */}
                      <div className="flex items-center gap-1" title="Order Stage Progress">
                        {statusSteps.map((step, idx) => {
                          const isDone = currentStepIndex >= idx;
                          const isCurrent = currentStepIndex === idx;
                          return (
                            <div
                              key={step.key}
                              title={`${step.label}${isCurrent ? ' (Current)' : isDone ? ' (Completed)' : ''}`}
                              className={`h-1.5 rounded-full transition-all ${
                                isCurrent
                                  ? 'w-5 bg-orange-500 shadow-sm'
                                  : isDone
                                  ? 'w-2 bg-emerald-500'
                                  : 'w-2 bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Customer Feedback Section */}
                  {isAccepted && !isCancelled && (
                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
                      {order.review ? (
                        <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              Your Feedback Submitted
                            </span>
                            <span className="font-extrabold text-amber-600">
                              {'⭐'.repeat(Math.round(order.review.rating))} ({order.review.rating}/5)
                            </span>
                          </div>
                          {order.review.comment && (
                            <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">
                              "{order.review.comment}"
                            </p>
                          )}
                        </div>
                      ) : feedbackOrderId === order.id ? (
                        <form
                          onSubmit={(e) => handleSubmitFeedback(e, order)}
                          className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-slate-800/80 border border-orange-200 dark:border-slate-700 space-y-2.5 animate-fade-in"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Rate your experience with {order.restaurant?.name || 'Restaurant'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFeedbackOrderId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          {/* Star Rating Controller */}
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="p-1 hover:scale-125 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-slate-500 ml-1">{rating} / 5 Stars</span>
                          </div>

                          <textarea
                            rows={2}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your feedback (e.g. food taste, packaging, delivery speed)..."
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-200"
                          />

                          <button
                            type="submit"
                            disabled={submittingFeedback}
                            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 active:scale-95"
                          >
                            {submittingFeedback ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            <span>Send Feedback</span>
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setFeedbackOrderId(order.id);
                            setRating(5);
                            setComment('');
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Rate & Leave Feedback</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Official Order Acceptance Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        order={selectedReceiptOrder}
        onClose={() => setShowReceiptModal(false)}
        isAdminView={false}
      />
    </div>
  );
};
