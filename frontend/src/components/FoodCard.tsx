import React from 'react';
import type { Food } from '../types';
import { useCart } from '../context/CartContext';
import { Star, Plus, Minus } from 'lucide-react';

interface FoodCardProps {
  food: Food;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart?.items?.find((item) => item.foodId === food.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const isVeg = food.foodType === 'VEG';

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-4 gap-4">
      
      {/* Image & Badges Container */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg shadow flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase">
          <span
            className={`w-2.5 h-2.5 rounded-full border-2 ${
              isVeg ? 'bg-emerald-500 border-emerald-600' : 'bg-rose-500 border-rose-600'
            }`}
          />
          <span className={isVeg ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
            {isVeg ? 'VEG' : 'NON-VEG'}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{food.rating}</span>
        </div>
      </div>

      {/* Food Details */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition-colors line-clamp-1">
            {food.name}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Price & Cart Action Footer */}
        <div className="pt-2 flex items-center justify-between gap-2">
          
          {/* Pricing */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                ₹{food.discountPrice || food.price}
              </span>
              {food.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{food.price}
                </span>
              )}
            </div>
            {food.discountPrice && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Save ₹{food.price - food.discountPrice}
              </span>
            )}
          </div>

          {/* Add to Cart / Quantity Controller */}
          {currentQuantity > 0 && cartItem ? (
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-full px-2 py-1 shadow-sm">
              <button
                onClick={() => updateQuantity(cartItem.id, currentQuantity - 1)}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors shadow-sm"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-orange-600 dark:text-orange-400 min-w-[16px] text-center">
                {currentQuantity}
              </span>
              <button
                onClick={() => updateQuantity(cartItem.id, currentQuantity + 1)}
                className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(food.id, 1)}
              className="px-4 py-2 rounded-full text-xs font-extrabold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-500/20 transition-all transform active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>ADD</span>
            </button>
          )}

        </div>
      </div>

    </div>
  );
};
