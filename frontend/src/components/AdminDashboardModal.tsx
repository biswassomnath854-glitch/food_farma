import React, { useState, useEffect } from 'react';
import type { OrderType, OrderStatus, Food, Restaurant, Category, User } from '../types';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  X,
  ShieldCheck,
  IndianRupee,
  ShoppingBag,
  Users,
  Store,
  Loader2,
  Plus,
  Trash2,
  Utensils,
  Ban,
  Layers,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  Lock,
  Mail,
  UserCheck,
  Settings,
  ArrowLeft,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'foods' | 'restaurants' | 'categories' | 'users' | 'settings'>('orders');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Order Receipt Modal state
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderType | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Admin credentials state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const { showToast } = useToast();

  // Form Modals for Creation
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [newFood, setNewFood] = useState({
    restaurantId: '',
    categoryId: '',
    name: '',
    description: '',
    price: 199,
    discountPrice: 169,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop',
    foodType: 'VEG' as 'VEG' | 'NON_VEG',
  });

  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    description: '',
    address: '',
    cuisines: '',
    deliveryTime: '25-35 min',
    minOrder: 150,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop',
  });

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen, activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, foodsRes, restRes, catRes, usersRes, meRes]: any = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/orders?limit=50'),
        apiClient.get('/foods'),
        apiClient.get('/restaurants'),
        apiClient.get('/categories'),
        apiClient.get('/admin/users'),
        apiClient.get('/auth/me'),
      ]);

      if (statsRes.success) setStats(statsRes.data?.metrics);
      if (ordersRes.success) setOrders(ordersRes.data?.orders || []);
      if (foodsRes.success) setFoods(foodsRes.data || []);
      if (restRes.success) setRestaurants(restRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (meRes.success && meRes.data) {
        setAdminName(meRes.data.name || '');
        setAdminEmail(meRes.data.email || '');
        setAdminPhone(meRes.data.phone || '');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Status Handler
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (newStatus === 'CANCELLED') {
      const isRefundEligible = currentOrder && ['PENDING', 'CONFIRMED', 'PREPARING'].includes(currentOrder.status) && currentOrder.paymentStatus === 'SUCCESS';
      const msg = isRefundEligible
        ? `Cancel this order? A 100% refund of ₹${currentOrder.totalAmount} will automatically be processed to the customer since it is still in the ${currentOrder.status} stage.`
        : `Are you sure you want to mark this order as CANCELLED?`;
      if (!confirm(msg)) return;
    }

    try {
      setUpdatingId(orderId);
      const res: any = await apiClient.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        showToast(res.message || `Order status updated to ${newStatus}`, 'success');
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...(res.data || {}), status: newStatus } : o)));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // User Status Toggle
  const handleToggleUser = async (userId: string) => {
    try {
      setUpdatingId(userId);
      const res: any = await apiClient.put(`/admin/users/${userId}/status`);
      if (res.success) {
        showToast(`User status updated: ${res.data.status}`, 'info');
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: res.data.status } : u)));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle user status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Food Item Actions
  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.restaurantId || !newFood.categoryId) {
      showToast('Please select restaurant and category', 'error');
      return;
    }
    try {
      const res: any = await apiClient.post('/foods', newFood);
      if (res.success) {
        showToast('Food dish added to menu!', 'success');
        setFoods((prev) => [res.data, ...prev]);
        setShowFoodForm(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add food dish', 'error');
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!confirm('Are you sure you want to delete this dish from menu?')) return;
    try {
      const res: any = await apiClient.delete(`/foods/${foodId}`);
      if (res.success) {
        showToast('Dish deleted successfully', 'info');
        setFoods((prev) => prev.filter((f) => f.id !== foodId));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete dish', 'error');
    }
  };

  const handleToggleFoodAvailability = async (food: Food) => {
    try {
      const res: any = await apiClient.put(`/foods/${food.id}`, { isAvailable: !food.isAvailable });
      if (res.success) {
        showToast(`Dish marked as ${res.data.isAvailable ? 'In Stock' : 'Out of Stock'}`, 'info');
        setFoods((prev) => prev.map((f) => (f.id === food.id ? { ...f, isAvailable: res.data.isAvailable } : f)));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update availability', 'error');
    }
  };

  // Restaurant Actions
  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await apiClient.post('/restaurants', newRestaurant);
      if (res.success) {
        showToast('Restaurant added!', 'success');
        setRestaurants((prev) => [res.data, ...prev]);
        setShowRestaurantForm(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add restaurant', 'error');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Delete restaurant? All associated dishes will be removed.')) return;
    try {
      const res: any = await apiClient.delete(`/restaurants/${id}`);
      if (res.success) {
        showToast('Restaurant removed', 'info');
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete restaurant', 'error');
    }
  };

  // Category Actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await apiClient.post('/categories', newCategory);
      if (res.success) {
        showToast('Category created!', 'success');
        setCategories((prev) => [...prev, res.data]);
        setShowCategoryForm(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete category?')) return;
    try {
      const res: any = await apiClient.delete(`/categories/${id}`);
      if (res.success) {
        showToast('Category deleted', 'info');
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  // Admin Settings Handlers
  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res: any = await apiClient.put('/auth/profile', {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
      });
      if (res.success) {
        showToast('Admin profile & email updated successfully!', 'success');
        if (res.data) {
          setAdminName(res.data.name);
          setAdminEmail(res.data.email);
          setAdminPhone(res.data.phone || '');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update admin credentials', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }
    try {
      setChangingPassword(true);
      const res: any = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        showToast('Admin password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col min-h-screen text-slate-900 dark:text-slate-100 animate-fade-in">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Active Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Manage live orders, menu items, restaurants, and user permissions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              title="Return to customer food storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6 flex-1">
        {/* Top Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
              <span className="text-xs font-bold">Total Revenue</span>
              <IndianRupee className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
              <span className="text-xs font-bold">Total Orders</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats?.totalOrders || 0}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-bold">Total Users</span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{users.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-bold">Restaurants</span>
              <Store className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{restaurants.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
          <div className="flex overflow-x-auto gap-2 scrollbar-none text-xs font-bold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('foods')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'foods'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Food Menu ({foods.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('restaurants')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'restaurants'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Restaurants ({restaurants.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'categories'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Tab Body Contents */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm min-h-[450px]">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span>Loading admin details...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer Details</th>
                          <th className="p-3">Restaurant</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Payment</th>
                          <th className="p-3">Status Action</th>
                          <th className="p-3 text-center">Order Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 font-mono font-bold text-orange-600">#{order.id.slice(0, 8)}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {order.address?.fullName || order.user?.name || 'Customer'}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {order.address?.phone || order.user?.phone || order.user?.email || 'No phone'}
                              </div>
                            </td>
                            <td className="p-3 font-medium">{order.restaurant?.name || 'Partner'}</td>
                            <td className="p-3 font-bold">₹{order.totalAmount}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.paymentStatus === 'REFUNDED'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : order.paymentStatus === 'SUCCESS'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}>
                                {order.paymentStatus === 'REFUNDED' ? 'REFUNDED' : order.paymentStatus}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                {order.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                                    disabled={updatingId === order.id}
                                    className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                                    title="Accept & Confirm Order"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Accept</span>
                                  </button>
                                )}
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                  disabled={updatingId === order.id}
                                  className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs outline-none"
                                >
                                  {statusOptions.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedReceiptOrder(order);
                                  setShowReceiptModal(true);
                                }}
                                className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 transition-all flex items-center gap-1.5 mx-auto shadow-sm cursor-pointer"
                                title="View Customer Details & Order Receipt"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: FOOD MENU MANAGER */}
              {activeTab === 'foods' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Food Menu Catalog ({foods.length})</h3>
                    <button
                      onClick={() => setShowFoodForm((prev) => !prev)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showFoodForm ? 'Cancel' : 'Add New Dish'}</span>
                    </button>
                  </div>

                  {showFoodForm && (
                    <form onSubmit={handleCreateFood} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          required
                          value={newFood.restaurantId}
                          onChange={(e) => setNewFood({ ...newFood, restaurantId: e.target.value })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        >
                          <option value="">Select Restaurant...</option>
                          {restaurants.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>

                        <select
                          required
                          value={newFood.categoryId}
                          onChange={(e) => setNewFood({ ...newFood, categoryId: e.target.value })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        >
                          <option value="">Select Category...</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Dish Name"
                          required
                          value={newFood.name}
                          onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />

                        <select
                          value={newFood.foodType}
                          onChange={(e) => setNewFood({ ...newFood, foodType: e.target.value as any })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        >
                          <option value="VEG">VEG</option>
                          <option value="NON_VEG">NON-VEG</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Description"
                        required
                        value={newFood.description}
                        onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="number"
                          placeholder="Original Price"
                          required
                          value={newFood.price}
                          onChange={(e) => setNewFood({ ...newFood, price: parseFloat(e.target.value) })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Discount Price"
                          value={newFood.discountPrice}
                          onChange={(e) => setNewFood({ ...newFood, discountPrice: parseFloat(e.target.value) })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={newFood.image}
                          onChange={(e) => setNewFood({ ...newFood, image: e.target.value })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                      >
                        Save & Publish Dish
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {foods.map((food) => (
                      <div key={food.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                        <img src={food.image} alt={food.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate">{food.name}</h4>
                          <p className="text-[11px] text-orange-600 font-extrabold">₹{food.discountPrice || food.price}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${food.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {food.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleFoodAvailability(food)}
                            className="p-1.5 text-slate-500 hover:text-purple-600"
                            title="Toggle In-Stock Availability"
                          >
                            {food.isAvailable ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                          </button>
                          <button
                            onClick={() => handleDeleteFood(food.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            title="Delete dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: RESTAURANT MANAGER */}
              {activeTab === 'restaurants' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Restaurant Dining Partners ({restaurants.length})</h3>
                    <button
                      onClick={() => setShowRestaurantForm((prev) => !prev)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showRestaurantForm ? 'Cancel' : 'Add Restaurant'}</span>
                    </button>
                  </div>

                  {showRestaurantForm && (
                    <form onSubmit={handleCreateRestaurant} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Restaurant Name"
                          required
                          value={newRestaurant.name}
                          onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Cuisines (e.g. Biryani, Italian)"
                          required
                          value={newRestaurant.cuisines}
                          onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisines: e.target.value })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Description"
                        required
                        value={newRestaurant.description}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        required
                        value={newRestaurant.address}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Delivery Time"
                          value={newRestaurant.deliveryTime}
                          onChange={(e) => setNewRestaurant({ ...newRestaurant, deliveryTime: e.target.value })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Min Order"
                          value={newRestaurant.minOrder}
                          onChange={(e) => setNewRestaurant({ ...newRestaurant, minOrder: parseFloat(e.target.value) })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={newRestaurant.image}
                          onChange={(e) => setNewRestaurant({ ...newRestaurant, image: e.target.value })}
                          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                        />
                      </div>
                      <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">
                        Save Restaurant
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {restaurants.map((rest) => (
                      <div key={rest.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                        <img src={rest.image || rest.coverImage} alt={rest.name} className="w-16 h-16 rounded-2xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">{rest.name}</h4>
                          <p className="text-xs text-slate-500 truncate">{rest.cuisines || rest.address}</p>
                          <p className="text-[11px] text-amber-600 font-bold">⭐ {rest.rating} • {rest.deliveryTime}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteRestaurant(rest.id)}
                          className="p-2 text-slate-400 hover:text-rose-600"
                          title="Delete Restaurant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORY MANAGER */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Food Categories ({categories.length})</h3>
                    <button
                      onClick={() => setShowCategoryForm((prev) => !prev)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showCategoryForm ? 'Cancel' : 'Add Category'}</span>
                    </button>
                  </div>

                  {showCategoryForm && (
                    <form onSubmit={handleCreateCategory} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <input
                        type="text"
                        placeholder="Category Name (e.g. Tacos)"
                        required
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        required
                        value={newCategory.image}
                        onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                      />
                      <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">
                        Create Category
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-bold text-xs truncate">{cat.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: USER ACCOUNTS */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">User & Customer Accounts ({users.length})</h3>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3">User Name</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Account Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map((usr) => (
                          <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 font-bold">{usr.name}</td>
                            <td className="p-3 font-medium text-slate-500">{usr.email}</td>
                            <td className="p-3 font-bold">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${usr.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                {usr.role}
                              </span>
                            </td>
                            <td className="p-3 font-bold">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${usr.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {usr.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {usr.role !== 'ADMIN' && (
                                <button
                                  onClick={() => handleToggleUser(usr.id)}
                                  disabled={updatingId === usr.id}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors ${usr.status === 'ACTIVE'
                                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>{usr.status === 'ACTIVE' ? 'Block User' : 'Unblock User'}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: ADMIN SETTINGS & CREDENTIALS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Client Handoff Info Banner */}
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 flex items-start gap-3">
                    <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-sm">Client Account Management</p>
                      <p>
                        Use this tab to update your Admin email and login password. When transferring this site to a new client, they can change their login credentials here at any time.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Admin Profile & Email */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                      <div className="flex items-center gap-2 font-bold text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin Account Details</span>
                      </div>

                      <form onSubmit={handleUpdateAdminProfile} className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Admin Name</label>
                          <input
                            type="text"
                            required
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Client / Store Admin Name"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Admin Login Email</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                              placeholder="admin@clientstore.com"
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Contact Phone</label>
                          <input
                            type="text"
                            value={adminPhone}
                            onChange={(e) => setAdminPhone(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Phone number"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={updatingProfile}
                          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
                        </button>
                      </form>
                    </div>

                    {/* Card 2: Change Admin Password */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                      <div className="flex items-center gap-2 font-bold text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                        <Lock className="w-4 h-4 text-purple-600" />
                        <span>Change Password</span>
                      </div>

                      <form onSubmit={handleChangeAdminPassword} className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Current Password</label>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="••••••••"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">New Password</label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="At least 6 characters"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Re-enter new password"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Admin Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Admin Order Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        order={selectedReceiptOrder}
        onClose={() => setShowReceiptModal(false)}
        isAdminView={true}
      />
    </div>
  );
};
