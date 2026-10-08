import React from 'react';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdminView: boolean;
  setIsAdminView: (isAdmin: boolean) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  setCurrentTab,
  isAdminView,
  setIsAdminView,
}) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  if (isAdminView) return null; // Hide customer mobile nav when in admin dashboard

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 lg:hidden py-2 px-3">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => {
            setCurrentTab('home');
            setIsAdminView(false);
          }}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            currentTab === 'home' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <Home size={20} />
          <span className="text-[10px] mt-1">Home</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => {
            setCurrentTab('shop');
            setIsAdminView(false);
          }}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            currentTab === 'shop' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <Compass size={20} />
          <span className="text-[10px] mt-1">Shop</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => {
            setCurrentTab('wishlist');
            setIsAdminView(false);
          }}
          className={`relative flex flex-col items-center justify-center p-1.5 transition-colors ${
            currentTab === 'wishlist' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <div className="relative">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#D9737C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Wishlist</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center p-1.5 text-stone-500 hover:text-stone-900 transition-colors"
        >
          <div className="relative">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-stone-900 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Cart</span>
        </button>

        {/* Account */}
        <button
          onClick={() => {
            setCurrentTab('account');
            setIsAdminView(false);
          }}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
            currentTab === 'account' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <User size={20} />
          <span className="text-[10px] mt-1">Account</span>
        </button>
      </div>
    </div>
  );
};
