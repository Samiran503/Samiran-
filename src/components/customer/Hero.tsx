import React from 'react';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroProps {
  onShopClick: () => void;
  onExploreSkincare: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onExploreSkincare }) => {
  const { homepageContent } = useStore();

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAD8D0]/60 border border-[#DFCEBD] text-stone-900 text-xs tracking-wider uppercase font-medium">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>Autumn Glow Collection 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 font-medium leading-[1.1] tracking-tight">
              {homepageContent.heroTitle || 'Beauty that feels like you.'}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {homepageContent.heroSubtitle ||
                'Discover beauty essentials carefully selected for your everyday glow. Pure pigments, soothing botanicals, and Indian undertone mastery.'}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onShopClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <span>{homepageContent.heroCtaText || 'Shop Now'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onExploreSkincare}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-stone-800 border border-stone-300 hover:border-stone-800 px-7 py-4 rounded-full text-sm font-semibold tracking-wider transition-all duration-300"
              >
                <span>Explore Skincare</span>
              </button>
            </div>

            {/* Trust Quote / Social Proof */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-stone-600">
              <div className="flex -space-x-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className="fill-[#C5A059] text-[#C5A059]" />
                ))}
              </div>
              <span className="font-medium text-stone-800">4.9 / 5.0</span>
              <span className="text-stone-300">|</span>
              <span>Trusted by 10,000+ Indian Beauty Lovers</span>
            </div>
          </div>

          {/* Right Hero Image Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Blur Background Circle */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#E6D5C3]/40 to-[#F7E7E2]/50 rounded-3xl blur-2xl -z-10" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 aspect-[4/5] bg-stone-100">
                <img
                  src={
                    homepageContent.heroBannerUrl ||
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt="Zeemba Cosmetics Collection"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Product Badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-100/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] tracking-widest text-[#C5A059] uppercase font-bold">
                      Iconic Formula
                    </span>
                    <h4 className="text-sm font-semibold text-stone-900">
                      24K Saffron Glow Elixir
                    </h4>
                    <p className="text-xs text-stone-500">Pure Kashmiri Saffron & Gold</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-stone-900">₹1,199</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">20% Off</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
