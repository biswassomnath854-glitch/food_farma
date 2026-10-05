import React from 'react';
import type { OrderType } from '../types';
import {
  X,
  ArrowLeft,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Store,
  Receipt,
  CreditCard,
  Banknote,
  Sparkles,
} from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  order: OrderType | null;
  onClose: () => void;
  isAdminView?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  order,
  onClose,
  isAdminView = false,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAccepted = ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
    order.status
  );

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in print:p-0 print:static print:bg-white">
      {/* Backdrop (Clicking outside does NOT close receipt to prevent accidental dismissal) */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm print:hidden" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 text-slate-900 dark:text-slate-100 z-10 my-4 print:border-none print:shadow-none print:p-4 print:m-0 print:text-black print:w-full"
      >
        {/* Actions Bar (Hide on print) */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            {/* Primary Back Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
              title={isAdminView ? 'Back to Admin Dashboard' : 'Back to Orders'}
            >
              <ArrowLeft className="w-4 h-4 text-orange-500" />
              <span>{isAdminView ? 'Back to Dashboard' : 'Back to Orders'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Receipt className="w-4 h-4" />
              </span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {isAdminView ? 'Admin Receipt' : 'Order Receipt'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4 text-orange-500" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="pt-4 space-y-4">
          {/* Receipt Header */}
          <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                  Eat N Bite
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  Tax Invoice
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Food Farma Platform</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold font-mono text-orange-600 dark:text-orange-400">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-[10px] text-slate-400">{formattedDate}</p>
            </div>
          </div>

          {/* Acceptance / Refund Status Bar */}
          {order.paymentStatus === 'REFUNDED' ? (
            <div className="p-2.5 rounded-xl border flex items-center justify-between gap-2 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                  ✓
                </span>
                <span className="font-bold">
                  Cancelled • ₹{order.refundAmount || order.totalAmount} 100% Refund Issued
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 shadow-sm shrink-0">
                REFUNDED
              </span>
            </div>
          ) : (
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                isAccepted
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : order.status === 'CANCELLED'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {isAccepted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="font-bold">
                  {isAccepted
                    ? 'Confirmed by Restaurant'
                    : order.status === 'CANCELLED'
                    ? 'Order Cancelled'
                    : 'Order Placed (Awaiting Acceptance)'}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 shadow-sm shrink-0">
                {order.status}
              </span>
            </div>
          )}

          {/* Two-Column Grid: Customer Details & Restaurant Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Customer Details Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200/60 dark:border-slate-700">
                <UserIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>Delivery Details</span>
              </div>
              <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                {order.address?.fullName || order.user?.name || 'Customer'}
              </p>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{order.address?.phone || order.user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <p className="line-clamp-2 leading-tight">
                  {order.address?.addressLine ? (
                    `${order.address.addressLine}, ${order.address.city}`
                  ) : (
                    order.deliveryAddress || 'Standard Delivery Location'
                  )}
                </p>
              </div>
            </div>

            {/* Restaurant Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200/60 dark:border-slate-700">
                <Store className="w-3.5 h-3.5 text-purple-500" />
                <span>Restaurant Partner</span>
              </div>
              <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                {order.restaurant?.name || 'Partner Restaurant'}
              </p>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Est. Delivery: 25 - 35 mins</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FSSAI Certified Partner</span>
              </div>
            </div>
          </div>

          {/* Itemized Foods Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Price</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.foodType === 'VEG' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{item.foodName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-slate-500">₹{item.price}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-center text-slate-400">
                      Standard Order Package
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financials & Payment Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            {/* Payment Method Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto min-w-[220px] space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Payment Method</span>
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-slate-100">
                {order.paymentMethod === 'ONLINE' ? (
                  <CreditCard className="w-4 h-4 text-blue-500" />
                ) : (
                  <Banknote className="w-4 h-4 text-emerald-500" />
                )}
                <span>{order.paymentMethod === 'ONLINE' ? 'Razorpay Secure Payment' : 'Cash on Delivery'}</span>
              </div>
              <p className="text-[11px] font-bold">
                Status:{' '}
                {order.paymentStatus === 'REFUNDED' ? (
                  <span className="text-purple-600 dark:text-purple-400 font-black">
                    REFUNDED (₹{order.refundAmount || order.totalAmount})
                  </span>
                ) : order.paymentStatus === 'SUCCESS' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Payment Verified (PAID)</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">{order.paymentStatus}</span>
                )}
              </p>
              {order.refundId && (
                <p className="text-[10px] font-mono text-slate-400">Refund Ref: #{order.refundId}</p>
              )}
            </div>

            {/* Bill Summary */}
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST & Restaurant Taxes (5%)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{order.tax}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-black text-slate-900 dark:text-slate-100">
                <span>Total Amount</span>
                <span className="text-orange-600 dark:text-orange-400 text-base">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Customer Feedback if already submitted */}
          {order.review && (
            <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Customer Feedback & Rating
                </span>
                <span className="text-xs font-black text-amber-600">
                  {'⭐'.repeat(Math.round(order.review.rating))} ({order.review.rating}/5)
                </span>
              </div>
              {order.review.comment && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{order.review.comment}"
                </p>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 text-center text-[11px] text-slate-400 space-y-1">
            <p>Thank you for choosing Eat N Bite Food Farma!</p>
            <p>For order queries or delivery assistance, reach support at support@foodfarma.com</p>
          </div>

          {/* Bottom Actions Bar (Hide on print) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 print:hidden">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95 border border-slate-200/60 dark:border-slate-700/60"
            >
              <ArrowLeft className="w-4 h-4 text-orange-500" />
              <span>{isAdminView ? 'Back to Dashboard' : 'Back to Orders'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
