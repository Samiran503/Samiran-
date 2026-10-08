import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { trackEvent } from '../../services/analytics';
import { Product } from '../../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSelectCategory?: (slug: string) => void;
  onSelectProduct?: (product: Product) => void;
  isAdminView: boolean;
  setIsAdminView: (isAdmin: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onSelectCategory,
  onSelectProduct,
  isAdminView,
  setIsAdminView,
}) => {
  const { homepageContent, categories, products, storeSettings } = useStore();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, userProfile, isAdmin, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search products
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.isActive &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackEvent('search', { query: searchQuery });
      setCurrentTab('shop');
      setIsSearchOpen(false);
    }
  };

  const handleResultClick = (prod: Product) => {
    if (onSelectProduct) {
      onSelectProduct(prod);
    }
    trackEvent('product_view', { productId: prod.id, name: prod.name });
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EBE5DE] transition-all">
      {/* Top Announcement Bar */}
      {homepageContent.announcementText && (
        <div className="bg-[#1C1917] text-[#F5F2EB] py-1.5 px-4 text-xs tracking-wider text-center font-medium overflow-hidden">
          <div className="animate-pulse flex items-center justify-center gap-2">
            <span>{homepageContent.announcementText}</span>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-800 hover:text-black rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setCurrentTab('home');
                setIsAdminView(false);
              }}
              className="text-left group focus:outline-none"
            >
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-medium text-stone-900 uppercase transition-colors group-hover:text-stone-700">
                  ZEEMBA
                </span>
                <span className="text-[10px] tracking-[0.35em] text-[#C5A059] font-medium uppercase -mt-1 pl-0.5">
                  COSMETICS
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium tracking-wide text-stone-700">
            <button
              onClick={() => {
                setCurrentTab('home');
                setIsAdminView(false);
              }}
              className={`transition-colors hover:text-stone-900 pb-1 relative ${
                currentTab === 'home' && !isAdminView
                  ? 'text-stone-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                  : ''
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setCurrentTab('shop');
                setIsAdminView(false);
              }}
              className={`transition-colors hover:text-stone-900 pb-1 relative ${
                currentTab === 'shop' && !isAdminView
                  ? 'text-stone-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                  : ''
              }`}
            >
              Shop All
            </button>

            {/* Categories Dropdown */}
            <div className="relative" onMouseLeave={() => setIsCategoryDropdownOpen(false)}>
              <button
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center gap-1 transition-colors hover:text-stone-900 pb-1"
              >
                <span>Categories</span>
                <ChevronDown size={14} className="text-stone-500" />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-fadeIn">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat.slug);
                        setCurrentTab('shop');
                        setIsAdminView(false);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs tracking-wide text-stone-700 hover:bg-[#FAF8F5] hover:text-stone-900 flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-stone-400">View</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setCurrentTab('shop');
                setIsAdminView(false);
              }}
              className="transition-colors hover:text-stone-900"
            >
              Best Sellers
            </button>

            <button
              onClick={() => {
                setCurrentTab('offers');
                setIsAdminView(false);
              }}
              className={`transition-colors hover:text-stone-900 flex items-center gap-1 text-[#C5A059] font-medium pb-1 relative ${
                currentTab === 'offers' ? 'font-semibold' : ''
              }`}
            >
              <Sparkles size={14} />
              <span>Offers</span>
            </button>
          </nav>

          {/* Right Action Icons (Search, Wishlist, Cart, Account, Admin Shortcut) */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-stone-700 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100/70"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Live Search Modal/Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 z-50">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="Search lipstick, kajal, serum..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-stone-800"
                    />
                    <Search
                      size={18}
                      className="absolute left-3.5 top-3.5 text-stone-400"
                    />
                  </form>

                  {/* Results list */}
                  {searchQuery.trim() && (
                    <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-stone-100">
                      {searchResults.length > 0 ? (
                        searchResults.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => handleResultClick(prod)}
                            className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <img
                              src={prod.thumbnail}
                              alt={prod.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-stone-500 uppercase">{prod.category}</p>
                              <p className="text-sm font-medium text-stone-900 truncate">
                                {prod.name}
                              </p>
                              <p className="text-xs font-semibold text-stone-800">
                                {storeSettings.currency}{prod.sellingPrice}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-stone-500">
                          No beauty essentials found matching "{searchQuery}".
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => {
                setCurrentTab('wishlist');
                setIsAdminView(false);
              }}
              className="relative p-2 text-stone-700 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100/70"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#D9737C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-700 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100/70"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-stone-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-stone-700 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100/70 flex items-center gap-1"
                aria-label="User Account"
              >
                <UserIcon size={20} />
                {isAdmin && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2.5 z-50 animate-fadeIn">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-xs text-stone-500">Signed in as</p>
                        <p className="text-sm font-semibold text-stone-900 truncate">
                          {userProfile?.name || currentUser.displayName || currentUser.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                            Store Admin
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentTab('account');
                          setIsAdminView(false);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <UserIcon size={16} />
                        <span>My Account & Orders</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsAdminView(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-emerald-700 font-medium hover:bg-emerald-50 flex items-center gap-2"
                        >
                          <ShieldCheck size={16} />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <div className="border-t border-stone-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs text-stone-500 mb-3 px-1">
                        Welcome to Zeemba Cosmetics. Sign in to view orders and save your wishlist.
                      </p>
                      <button
                        onClick={() => {
                          setCurrentTab('account');
                          setIsAdminView(false);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full bg-stone-900 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl text-center mb-2"
                      >
                        Sign In / Register
                      </button>
                      <button
                        onClick={() => {
                          setIsAdminView(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium py-2 rounded-xl text-center flex items-center justify-center gap-1"
                      >
                        <ShieldCheck size={14} />
                        <span>Admin Access</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Admin View Switch Button for Easy Navigation */}
            {isAdminView ? (
              <button
                onClick={() => setIsAdminView(false)}
                className="hidden sm:flex items-center gap-1.5 bg-stone-900 text-white text-xs px-3.5 py-1.5 rounded-full hover:bg-black font-medium transition-all"
              >
                <span>Storefront</span>
                <ExternalLink size={12} />
              </button>
            ) : (
              <button
                onClick={() => setIsAdminView(true)}
                className="hidden sm:flex items-center gap-1.5 border border-stone-300 hover:border-stone-800 text-stone-800 text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                title="Switch to Admin Dashboard"
              >
                <ShieldCheck size={14} className="text-[#C5A059]" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-stone-200 px-6 py-6 animate-fadeIn">
          <div className="flex flex-col space-y-4 text-base font-medium text-stone-800">
            <button
              onClick={() => {
                setCurrentTab('home');
                setIsAdminView(false);
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-stone-200/60"
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentTab('shop');
                setIsAdminView(false);
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-stone-200/60"
            >
              Shop All Products
            </button>
            <button
              onClick={() => {
                setCurrentTab('offers');
                setIsAdminView(false);
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-stone-200/60 text-[#C5A059]"
            >
              Special Offers & Coupons
            </button>
            <button
              onClick={() => {
                setCurrentTab('account');
                setIsAdminView(false);
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-stone-200/60"
            >
              My Account & Order Tracking
            </button>
            <button
              onClick={() => {
                setIsAdminView(true);
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 flex items-center justify-between text-stone-900 font-semibold"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#C5A059]" />
                Admin Dashboard
              </span>
              <span className="text-xs bg-stone-200 px-2 py-0.5 rounded">Management</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
