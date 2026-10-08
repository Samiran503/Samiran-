import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Heart,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import { Hero } from './Hero';
import { FeaturedCategories } from './FeaturedCategories';
import { ProductCard } from './ProductCard';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface HomePageProps {
  onNavigateShop: (categorySlug?: string) => void;
  onOpenProductDetails: (product: Product) => void;
  onOpenOffers: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateShop,
  onOpenProductDetails,
  onOpenOffers,
}) => {
  const { products, offers, homepageContent, storeSettings } = useStore();

  const [copiedCoupon, setCopiedCoupon] = React.useState<string | null>(null);

  const bestSellers = products.filter((p) => p.isBestSeller && p.isActive).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival && p.isActive).slice(0, 4);
  const featured = products.filter((p) => p.isFeatured && p.isActive).slice(0, 4);

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Banner */}
      <Hero
        onShopClick={() => onNavigateShop()}
        onExploreSkincare={() => onNavigateShop('skincare')}
      />

      {/* 2. Featured Categories Strip */}
      <FeaturedCategories onSelectCategory={(slug) => onNavigateShop(slug)} />

      {/* 3. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#C5A059] uppercase font-bold">
              Customer Obsessions
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
              Zeemba Best Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigateShop()}
            className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-[#C5A059] flex items-center gap-1 mt-2 sm:mt-0 transition-colors"
          >
            <span>View All Bestsellers</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenDetails={onOpenProductDetails}
            />
          ))}
        </div>
      </section>

      {/* 4. Special Offers & Promo Banners Section */}
      <section className="bg-[#FAF8F5] py-14 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs tracking-[0.25em] text-[#C5A059] uppercase font-bold">
              Exclusive Savings
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
              Active Offers & Secret Codes
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">
              Apply these codes at checkout or bag slide-over for instant rupee discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.filter((o) => o.isActive).map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#C5A059]/10 text-[#8B6B2B] text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  {offer.discountType === 'PERCENTAGE'
                    ? `${offer.discountValue}% OFF`
                    : `₹${offer.discountValue} FLAT`}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-stone-800">
                    <Tag size={16} className="text-[#C5A059]" />
                    <h3 className="text-sm font-bold">{offer.title}</h3>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">{offer.description}</p>
                  <p className="text-[11px] text-stone-400">
                    Min. cart value: {storeSettings.currency}
                    {offer.minOrderValue}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg tracking-wider">
                    {offer.couponCode}
                  </span>
                  <button
                    onClick={() => copyCouponCode(offer.couponCode)}
                    className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 transition-colors"
                  >
                    {copiedCoupon === offer.couponCode ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Beauty Spotlight Collection Feature */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1917] text-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 sm:p-12 space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold block">
              The Royal Ayurvedic Ritual
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium leading-tight text-[#FAF8F5]">
              Pure Kashmiri Saffron meets 24K Elemental Gold
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Centuries before commercial skincare, Indian royal courts practiced Kumkumadi and Saffron rituals for glowing translucency. Zeemba’s 24K Saffron Elixir is clinically calibrated for modern environmental stressors while preserving ancient botanical potency.
            </p>

            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#C5A059]" />
                <span>Zero artificial fragrances or toxic fillers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#C5A059]" />
                <span>Non-comedogenic & formulated for tropical humidity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#C5A059]" />
                <span>Visible radiance & pigment fading within 14 days</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateShop('skincare')}
                className="bg-[#C5A059] hover:bg-[#b58f47] text-white text-xs font-bold px-7 py-3.5 rounded-full uppercase tracking-wider transition-all shadow-md"
              >
                Discover The Glow Ritual
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 aspect-square sm:aspect-[4/3] lg:aspect-auto h-full">
            <img
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80"
              alt="Zeemba 24K Saffron Gold Ritual"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#C5A059] uppercase font-bold">
              Just Dropped
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigateShop()}
            className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-[#C5A059] flex items-center gap-1 mt-2 sm:mt-0 transition-colors"
          >
            <span>Explore All New</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onOpenDetails={onOpenProductDetails}
            />
          ))}
        </div>
      </section>

      {/* 7. Why Shop with Zeemba Cosmetics */}
      <section className="bg-white py-16 border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs tracking-[0.25em] text-[#C5A059] uppercase font-bold">
              The Zeemba Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
              Why Indian Beauty Lovers Choose Zeemba
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-[#C5A059] flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <Sparkles size={22} />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                True Indian Undertone Mastery
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                No ashy undertones, no white chalkiness. Every lipstick, blush, and foundation is specifically balanced with warm, olive, and golden pigments to enhance South Asian beauty.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-[#C5A059] flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Dermatologically Approved
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hypoallergenic, cruelty-free, and tested for sensitive skin. Formulated without parabens, phthalates, or harsh artificial sulfates.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-[#C5A059] flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <Truck size={22} />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Express Logistics & WhatsApp Care
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Dispatched within 24 hours across 19,000+ PIN codes with live tracking, Cash on Delivery, and direct WhatsApp customer support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs tracking-[0.25em] text-[#C5A059] uppercase font-bold">
            Real Love
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
            Loved Across India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex text-[#C5A059]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="fill-[#C5A059]" />
              ))}
            </div>
            <p className="text-xs text-stone-600 italic leading-relaxed">
              "The Royal Velvet Matte in 'Bombay Berry' is hands down the best lipstick I have ever owned. Stays on through coffee and lunch without drying my lips at all!"
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Dr. Tanya Mehta</span>
              <span className="text-stone-400">Mumbai</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex text-[#C5A059]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="fill-[#C5A059]" />
              ))}
            </div>
            <p className="text-xs text-stone-600 italic leading-relaxed">
              "The 24K Saffron Elixir completely changed my skin texture before my wedding. Gave me that ethereal glow without feeling heavy or oily under Bangalore weather."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Kavya Nambiar</span>
              <span className="text-stone-400">Bangalore</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex text-[#C5A059]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="fill-[#C5A059]" />
              ))}
            </div>
            <p className="text-xs text-stone-600 italic leading-relaxed">
              "Obsidian Kohl Kajal does not budge for 14 hours straight. Plus ordering via WhatsApp was so fast and effortless. Highly recommend Zeemba!"
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Pooja Verma</span>
              <span className="text-stone-400">Delhi NCR</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Newsletter Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8">
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-stone-200 space-y-4">
          <span className="text-xs tracking-[0.25em] text-[#C5A059] uppercase font-bold">
            The Glow Society
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 font-medium">
            Join the Zeemba Circle
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Subscribe for secret seasonal drops, beauty masterclass invites, and an instant 10% coupon code.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to Zeemba Glow Society! Check your inbox for code ZEEMBA10.');
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="flex-1 text-xs p-3.5 bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-1 focus:ring-stone-800"
            />
            <button
              type="submit"
              className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-6 py-3.5 rounded-full uppercase tracking-wider transition-colors shadow-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
