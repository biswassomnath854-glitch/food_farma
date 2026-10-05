import React from 'react';
import type { Restaurant } from '../types';
import { Star, Clock, MapPin } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSelect }) => {
  const isCurrentlyOpen = restaurant.isOpen !== false && restaurant.status !== 'CLOSED';

  return (
    <div
      onClick={() => onSelect(restaurant)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
    >
      {/* Cover Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={restaurant.image || restaurant.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md text-xs font-black text-amber-600 dark:text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{restaurant.rating}</span>
        </div>

        {/* Open/Closed Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
              isCurrentlyOpen
                ? 'bg-emerald-500/90 text-white'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            {isCurrentlyOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>

        {/* Delivery Time */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-300" />
          <span>{restaurant.deliveryTime}</span>
        </div>
      </div>

      {/* Restaurant Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {restaurant.cuisines || restaurant.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1 truncate max-w-[150px]">
            <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="truncate">{restaurant.location || restaurant.address || 'Bengaluru'}</span>
          </div>

          <span className="font-bold text-orange-600 dark:text-orange-400">
            ₹{restaurant.minOrder || 100} min
          </span>
        </div>
      </div>
    </div>
  );
};
