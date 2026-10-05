import React from 'react';
import { Flame, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-2xl my-6">
      
      {/* Decorative Background Patterns */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Column: Offer Content */}
        <div className="flex-1 space-y-5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Hot Deals & Crave-worthy Flavors</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Delicious Food <br />
            <span className="text-amber-200">Delivered Fast</span> To Your Door
          </h1>

          <p className="text-orange-100 text-sm sm:text-base max-w-xl font-medium">
            Explore top restaurants, wood-fired pizzas, dum biryanis, and juicy burgers.
            Order online with instant Razorpay & Cash on Delivery payment options.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-bold text-orange-100">
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>30 Min Express Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Piping Hot Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Verified Hygienic Kitchens</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Food Card */}
        <div className="relative flex-shrink-0 w-full max-w-xs sm:max-w-sm">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 group">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop"
              alt="Delicious Pizza Hero"
              className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
              <span className="text-amber-300 font-extrabold text-xs uppercase tracking-wider">Featured Today</span>
              <h3 className="text-lg font-bold text-white">Artisanal Loaded Pizzas</h3>
              <p className="text-xs text-slate-200 mt-0.5">Starting at just ₹199</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
