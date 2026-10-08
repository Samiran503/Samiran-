import React, { useState } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';

interface AccountViewProps {
  onOpenProductDetails: (product: Product) => void;
  onNavigateAdmin: () => void;
}

const ORDER_STAGES = [
  { key: 'NEW', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export const AccountView: React.FC<AccountViewProps> = ({
  onOpenProductDetails,
  onNavigateAdmin,
}) => {
  const {
    currentUser,
    userProfile,
    role,
    isAdmin,
    loginWithEmail,
    registerWithEmail,
    signInWithGoogle,
    resetPassword,
    logout,
  } = useAuth();
  const { orders, products, storeSettings } = useStore();
  const { wishlistIds } = useWishlist();

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Authenticated tab
  const [activeAccountTab, setActiveAccountTab] = useState<'orders' | 'wishlist' | 'profile'>(
    'orders'
  );

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        await loginWithEmail(emailInput, passwordInput);
      } else {
        if (!nameInput.trim()) {
          setAuthError('Please enter your full name');
          setAuthLoading(false);
          return;
        }
        await registerWithEmail(nameInput, emailInput, passwordInput);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailInput.trim()) {
      setAuthError('Please enter your email above to receive a password reset link.');
      return;
    }
    try {
      await resetPassword(emailInput);
      setResetSent(true);
      setAuthError('');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send reset email.');
    }
  };

  // If not logged in, render Login / Register view
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200">
          <div className="text-center mb-6">
            <span className="font-serif text-2xl tracking-[0.2em] font-medium text-stone-900 uppercase">
              ZEEMBA
            </span>
            <span className="text-[10px] tracking-[0.3em] text-[#C5A059] uppercase block font-medium -mt-1">
              COSMETICS
            </span>
            <h2 className="text-lg font-serif text-stone-800 mt-3 font-semibold">
              {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {authMode === 'login'
                ? 'Sign in to track orders & sync your beauty bag'
                : 'Join Zeemba for exclusive rewards & member perks'}
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] text-stone-400 uppercase tracking-widest font-medium">
              or with email
            </span>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{authError}</span>
            </div>
          )}

          {resetSent && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
              Password reset link sent to your email inbox!
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Roshni Kapoor"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-stone-700">Password</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-[#C5A059] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                minLength={6}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-stone-900 hover:bg-black text-white text-xs font-bold py-3.5 rounded-2xl tracking-wider uppercase transition-all shadow-md disabled:opacity-50"
            >
              {authLoading
                ? 'Processing...'
                : authMode === 'login'
                ? 'Sign In to Account'
                : 'Create Account'}
            </button>
          </form>

          {/* Toggle Tab */}
          <div className="mt-6 text-center text-xs text-stone-500">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                  className="font-bold text-stone-900 hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className="font-bold text-stone-900 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Wishlist products
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Authenticated User Profile View
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Account Header Strip */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border-2 border-stone-200 flex items-center justify-center text-stone-800 text-xl font-bold font-serif">
            {userProfile?.name?.charAt(0) || currentUser.email?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif text-stone-900 font-medium">
                {userProfile?.name || currentUser.displayName || 'Zeemba Customer'}
              </h1>
              {isAdmin && (
                <span className="bg-[#C5A059]/20 text-[#8B6B2B] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {role}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={onNavigateAdmin}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <ShieldCheck size={16} />
              <span>Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={() => logout()}
            className="border border-stone-200 text-stone-700 hover:text-red-600 hover:border-red-200 text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-sm font-semibold text-stone-500 mb-8">
        <button
          onClick={() => setActiveAccountTab('orders')}
          className={`pb-3.5 flex items-center gap-2 transition-colors ${
            activeAccountTab === 'orders'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'hover:text-stone-800'
          }`}
        >
          <Package size={18} />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveAccountTab('wishlist')}
          className={`pb-3.5 flex items-center gap-2 transition-colors ${
            activeAccountTab === 'wishlist'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'hover:text-stone-800'
          }`}
        >
          <Heart size={18} />
          <span>Wishlist ({wishlistIds.length})</span>
        </button>

        <button
          onClick={() => setActiveAccountTab('profile')}
          className={`pb-3.5 flex items-center gap-2 transition-colors ${
            activeAccountTab === 'profile'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'hover:text-stone-800'
          }`}
        >
          <User size={18} />
          <span>Profile & Address</span>
        </button>
      </div>

      {/* Tab 1: Orders Tab with Live Status Tracker */}
      {activeAccountTab === 'orders' && (
        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((ord) => {
              const currentStageIndex = ORDER_STAGES.findIndex((s) => s.key === ord.orderStatus);

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 space-y-5"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-900">
                          Order #{ord.id}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            ord.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN')} at{' '}
                        {new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-stone-500 block">Total Amount</span>
                        <span className="text-base font-bold text-stone-900">
                          {storeSettings.currency}
                          {ord.total}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const clean = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
                          window.open(
                            `https://wa.me/${clean}?text=Hello%20Zeemba,%20please%20update%20me%20on%20Order%20${ord.id}`,
                            '_blank'
                          );
                        }}
                        className="p-2 text-[#25D366] hover:bg-[#25D366]/10 rounded-full transition-colors"
                        title="Query Order on WhatsApp"
                      >
                        <MessageCircle size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Visual Step-by-Step Order Progress Timeline */}
                  {ord.orderStatus !== 'CANCELLED' && (
                    <div className="py-2">
                      <div className="grid grid-cols-6 gap-1 text-center relative">
                        {ORDER_STAGES.map((stg, sIdx) => {
                          const isDone = sIdx <= currentStageIndex;
                          const isCurrent = sIdx === currentStageIndex;

                          return (
                            <div key={stg.key} className="flex flex-col items-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1.5 transition-all ${
                                  isDone
                                    ? 'bg-stone-900 text-white font-bold'
                                    : 'bg-stone-100 text-stone-400'
                                } ${isCurrent ? 'ring-4 ring-stone-900/20' : ''}`}
                              >
                                {isDone ? <CheckCircle2 size={14} /> : sIdx + 1}
                              </div>
                              <span
                                className={`text-[10px] hidden sm:block ${
                                  isDone ? 'text-stone-900 font-semibold' : 'text-stone-400'
                                }`}
                              >
                                {stg.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="divide-y divide-stone-100">
                    {ord.items.map((item, iIdx) => (
                      <div key={iIdx} className="py-3 flex items-center gap-3">
                        <img
                          src={item.thumbnail}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg object-cover border border-stone-100"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-stone-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-stone-400">
                            {item.variantName ? `${item.variantName} • ` : ''}Qty: {item.quantity} ×{' '}
                            {storeSettings.currency}
                            {item.unitPrice}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-stone-800">
                          {storeSettings.currency}
                          {item.totalPrice}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping address footer */}
                  <div className="p-3 bg-[#FAF8F5] rounded-xl text-[11px] text-stone-600 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck size={14} className="text-stone-500" />
                      <span>
                        Shipping to: {ord.address}, {ord.city} - {ord.pincode} ({ord.phone})
                      </span>
                    </span>
                    <span className="font-semibold capitalize">{ord.paymentMethod} Payment</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-stone-200">
              <Package size={36} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-base font-semibold text-stone-800 mb-1">
                You haven't placed any orders yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                Explore our catalog to find royal velvet lipsticks and glass skin elixirs.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeAccountTab === 'wishlist' && (
        <div>
          {wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpenDetails={onOpenProductDetails}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-stone-200">
              <Heart size={36} className="mx-auto text-stone-300 mb-3" />
              <h3 className="text-base font-semibold text-stone-800 mb-1">
                Your wishlist is empty
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Click the heart icon on any product to save it to your personal wishlist.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile */}
      {activeAccountTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 max-w-xl">
          <h3 className="text-base font-serif font-semibold text-stone-900 mb-4">
            Customer Profile Information
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-500 mb-1 font-medium">Full Name</label>
              <p className="text-sm font-semibold text-stone-900">
                {userProfile?.name || currentUser.displayName || 'Customer'}
              </p>
            </div>
            <div>
              <label className="block text-stone-500 mb-1 font-medium">Registered Email</label>
              <p className="text-sm font-mono text-stone-900">{currentUser.email}</p>
            </div>
            <div>
              <label className="block text-stone-500 mb-1 font-medium">Account ID</label>
              <p className="text-xs font-mono text-stone-400">{currentUser.uid}</p>
            </div>
            <div>
              <label className="block text-stone-500 mb-1 font-medium">Account Role</label>
              <span className="inline-block bg-stone-100 text-stone-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px]">
                {role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
