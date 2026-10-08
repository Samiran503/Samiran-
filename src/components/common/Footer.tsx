import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { trackWhatsAppClick } from '../../services/analytics';

interface FooterProps {
  onOpenPolicy: (type: 'about' | 'shipping' | 'returns' | 'privacy' | 'terms' | 'faq' | 'contact') => void;
  onSelectCategory?: (slug: string) => void;
  onNavigateShop?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPolicy,
  onSelectCategory,
  onNavigateShop,
}) => {
  const { storeSettings, categories } = useStore();

  const handleWhatsApp = async () => {
    await trackWhatsAppClick('general', { location: 'footer' });
    const cleanNumber = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=Hi%20Zeemba%20Cosmetics,%20I'd%20like%20to%20know%20more%20about%20your%20products`, '_blank');
  };

  return (
    <footer className="bg-[#141211] text-[#EBE5DE] pt-16 pb-24 lg:pb-16 border-t border-stone-800">
      {/* Trust Highlights Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-stone-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-[#C5A059] mb-3">
              <Truck size={22} />
            </div>
            <h4 className="text-sm font-semibold tracking-wide text-white">Free Express Delivery</h4>
            <p className="text-xs text-stone-400 mt-1">Across all India on orders above ₹{storeSettings.freeDeliveryThreshold}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-[#C5A059] mb-3">
              <ShieldCheck size={22} />
            </div>
            <h4 className="text-sm font-semibold tracking-wide text-white">100% Authentic</h4>
            <p className="text-xs text-stone-400 mt-1">Direct from laboratory, dermatologically tested</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-[#C5A059] mb-3">
              <RotateCcw size={22} />
            </div>
            <h4 className="text-sm font-semibold tracking-wide text-white">7-Day Easy Returns</h4>
            <p className="text-xs text-stone-400 mt-1">Hassle-free replacement for transit damage</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-[#C5A059] mb-3">
              <Heart size={22} />
            </div>
            <h4 className="text-sm font-semibold tracking-wide text-white">Cruelty-Free & Clean</h4>
            <p className="text-xs text-stone-400 mt-1">Never tested on animals, ethically sourced botanicals</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] font-medium text-white uppercase">
                ZEEMBA
              </span>
              <span className="text-[10px] tracking-[0.35em] text-[#C5A059] font-medium uppercase block -mt-1">
                COSMETICS
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed pr-6">
              "Beauty that feels like you." Zeemba Cosmetics creates luxurious, high-performance makeup and skincare specifically tailored for Indian undertones and tropical lifestyles.
            </p>
            <div className="pt-2">
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs px-4 py-2 rounded-full transition-colors"
              >
                <MessageCircle size={16} />
                <span>Chat with Zeemba on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-stone-200 font-semibold mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat.slug);
                      if (onNavigateShop) onNavigateShop();
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onNavigateShop}
                  className="hover:text-white text-[#C5A059] font-medium transition-colors"
                >
                  View All Products →
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-stone-200 font-semibold mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={() => onOpenPolicy('shipping')} className="hover:text-white transition-colors">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('returns')} className="hover:text-white transition-colors">
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Brand */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-stone-200 font-semibold mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={() => onOpenPolicy('about')} className="hover:text-white transition-colors">
                  Our Story
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payment Safe Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
        <div>
          © {new Date().getFullYear()} ZEEMBA COSMETICS. All rights reserved. Registered Indian Trademark.
        </div>
        <div className="flex items-center gap-4 text-stone-300">
          <span>UPI / Cards / NetBanking / COD</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#C5A059]">
            <Sparkles size={12} />
            <span>Formulated for Indian Skin</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
