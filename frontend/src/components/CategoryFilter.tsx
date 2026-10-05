import React from 'react';
import type { Category } from '../types';
import { UtensilsCrossed, Leaf, Drumstick } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  foodTypeFilter: 'ALL' | 'VEG' | 'NON_VEG';
  setFoodTypeFilter: (type: 'ALL' | 'VEG' | 'NON_VEG') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  foodTypeFilter,
  setFoodTypeFilter,
}) => {
  return (
    <div className="space-y-4 my-8">
      {/* Header & Veg/Non-Veg Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Explore Categories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Filter by your favorite food cravings
          </p>
        </div>

        {/* Veg / Non-Veg Toggle Filter */}
        <div className="flex items-center p-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFoodTypeFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              foodTypeFilter === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
            <span>All Types</span>
          </button>

          <button
            type="button"
            onClick={() => setFoodTypeFilter(foodTypeFilter === 'VEG' ? 'ALL' : 'VEG')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              foodTypeFilter === 'VEG'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Veg Only</span>
          </button>

          <button
            type="button"
            onClick={() => setFoodTypeFilter(foodTypeFilter === 'NON_VEG' ? 'ALL' : 'NON_VEG')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              foodTypeFilter === 'NON_VEG'
                ? 'bg-rose-600 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
            }`}
          >
            <Drumstick className="w-3.5 h-3.5" />
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Category Pills List */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
            selectedCategory === null
              ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/25 scale-105'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500'
          }`}
        >
          <span>All Items</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/25 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500'
              }`}
            >
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              )}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
