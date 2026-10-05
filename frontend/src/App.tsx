import React, { useState, useEffect, useMemo } from 'react';
import type { Category, Restaurant, Food } from './types';
import { apiClient } from './api/client';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { RestaurantCard } from './components/RestaurantCard';
import { FoodCard } from './components/FoodCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AuthModal } from './components/AuthModal';
import { Store, Utensils, Sparkles, Loader2, ArrowLeft, Star, Clock, Leaf, Drumstick, UtensilsCrossed } from 'lucide-react';

const MainContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [foodTypeFilter, setFoodTypeFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Modal triggers
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [catRes, restRes, foodRes]: any = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/restaurants'),
        apiClient.get('/foods'),
      ]);

      if (catRes.success) setCategories(catRes.data || []);
      if (restRes.success) setRestaurants(restRes.data || []);
      if (foodRes.success) setFoods(foodRes.data || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Foods
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Search match
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = food.name.toLowerCase().includes(query);
        const matchesDesc = food.description.toLowerCase().includes(query);
        const matchesRest = food.restaurant?.name.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesRest) return false;
      }

      // Category match
      if (selectedCategory && food.categoryId !== selectedCategory) {
        return false;
      }

      // Food type (VEG / NON_VEG)
      if (foodTypeFilter !== 'ALL') {
        const typeNormalized = String(food.foodType || '').toUpperCase().replace('-', '_');
        const filterNormalized = String(foodTypeFilter).toUpperCase().replace('-', '_');
        if (typeNormalized !== filterNormalized) {
          return false;
        }
      }

      // Restaurant detail filter
      if (selectedRestaurant && food.restaurantId !== selectedRestaurant.id) {
        return false;
      }

      return true;
    });
  }, [foods, searchTerm, selectedCategory, foodTypeFilter, selectedRestaurant]);

  // Filtered Restaurants
  const filteredRestaurants = useMemo(() => {
    if (!searchTerm) return restaurants;
    const query = searchTerm.toLowerCase();
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.cuisines?.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
    );
  }, [restaurants, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAuth={(mode = 'login') => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenOrders={() => setOrdersModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Hero Promotional Banner */}
        <HeroBanner />

        {/* Category & Type Filter Pills */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          foodTypeFilter={foodTypeFilter}
          setFoodTypeFilter={setFoodTypeFilter}
        />

        {/* Selected Restaurant Banner View (if clicked) */}
        {selectedRestaurant && (
          <div className="my-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Back to all restaurants"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Viewing Restaurant Menu</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{selectedRestaurant.name}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedRestaurant.rating}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> {selectedRestaurant.deliveryTime}
                  </span>
                  <span>•</span>
                  <span>{selectedRestaurant.cuisines}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter('ALL')}
                  className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                    foodTypeFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
                  <span>All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter(foodTypeFilter === 'VEG' ? 'ALL' : 'VEG')}
                  className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                    foodTypeFilter === 'VEG'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter(foodTypeFilter === 'NON_VEG' ? 'ALL' : 'NON_VEG')}
                  className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                    foodTypeFilter === 'NON_VEG'
                      ? 'bg-rose-600 text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-rose-600'
                  }`}
                >
                  <Drumstick className="w-3.5 h-3.5" />
                  <span>Non-Veg</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRestaurant(null)}
                className="text-xs font-bold px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Back to All
              </button>
            </div>
          </div>
        )}

        {/* Featured Restaurants Section (Only shown when no specific category/food search active) */}
        {!selectedCategory && !searchTerm && !selectedRestaurant && (
          <section className="my-10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Store className="w-6 h-6 text-orange-500" />
                  Top Featured Restaurants
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Order from top-rated dining partners in your city
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSelect={(r) => setSelectedRestaurant(r)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Food Items Catalog */}
        <section className="my-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-orange-500" />
                {selectedRestaurant ? `${selectedRestaurant.name} Menu` : 'Delicious Dishes'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Showing {filteredFoods.length} items
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="text-xs font-bold">Loading mouth-watering menu...</span>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Utensils className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Food Items Found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                We couldn't find any dishes matching your filters. Try clearing your search or category filters!
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                  setFoodTypeFilter('ALL');
                  setSelectedRestaurant(null);
                }}
                className="mt-4 px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Cart Slide-over Panel */}
      <CartDrawer onProceedToCheckout={() => setCheckoutModalOpen(true)} />

      {/* Checkout & Razorpay Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onOrderSuccess={() => {
          setOrdersModalOpen(true);
        }}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={ordersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
      />

      {/* Admin Management Modal */}
      <AdminDashboardModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Eat N Bite Food Farma Platform &copy; 2026</span>
          </div>
          <p>Powered by React, Tailwind CSS, Node.js, Express & Sequelize</p>
        </div>
      </footer>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <MainContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
