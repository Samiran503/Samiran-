import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { HomePage } from './components/customer/HomePage';
import { ProductGrid } from './components/customer/ProductGrid';
import { CartDrawer } from './components/customer/CartDrawer';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { AccountView } from './components/customer/AccountView';
import { PolicyModal } from './components/customer/PolicyModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { Product } from './types';
import { trackEvent } from './services/analytics';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<'home' | 'shop' | 'offers' | 'wishlist' | 'account'>('home');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<
    'about' | 'shipping' | 'returns' | 'privacy' | 'terms' | 'faq' | 'contact' | null
  >(null);
  const [isAdminView, setIsAdminView] = useState(false);

  // Initial page view track
  useEffect(() => {
    trackEvent('page_view', { tab: currentTab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab, isAdminView]);

  // If in Admin Dashboard view, render the dedicated admin application
  if (isAdminView) {
    return (
      <AdminLayout
        onBackToStorefront={() => {
          setIsAdminView(false);
          setCurrentTab('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-[#EAD8D0]">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab as any);
          if (tab === 'shop') setSelectedCategorySlug('all');
        }}
        onSelectCategory={(slug) => {
          setSelectedCategorySlug(slug);
          setCurrentTab('shop');
        }}
        onSelectProduct={(p) => setActiveProductModal(p)}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        {currentTab === 'home' && (
          <HomePage
            onNavigateShop={(slug) => {
              setSelectedCategorySlug(slug || 'all');
              setCurrentTab('shop');
            }}
            onOpenProductDetails={(p) => setActiveProductModal(p)}
            onOpenOffers={() => setCurrentTab('offers')}
          />
        )}

        {currentTab === 'shop' && (
          <ProductGrid
            initialCategory={selectedCategorySlug}
            onOpenProductDetails={(p) => setActiveProductModal(p)}
          />
        )}

        {currentTab === 'offers' && (
          <div className="py-8">
            <ProductGrid
              initialCategory="all"
              onOpenProductDetails={(p) => setActiveProductModal(p)}
            />
          </div>
        )}

        {currentTab === 'wishlist' && (
          <AccountView
            onOpenProductDetails={(p) => setActiveProductModal(p)}
            onNavigateAdmin={() => setIsAdminView(true)}
          />
        )}

        {currentTab === 'account' && (
          <AccountView
            onOpenProductDetails={(p) => setActiveProductModal(p)}
            onNavigateAdmin={() => setIsAdminView(true)}
          />
        )}
      </main>

      {/* Floating WhatsApp Quick Concierge */}
      <WhatsAppButton />

      {/* Slide-over Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutModalOpen(true)} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onOpenCheckoutDirect={() => setIsCheckoutModalOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderCompleted={(orderId) => {
          trackEvent('purchase', { orderId });
        }}
      />

      {/* Policy Modal */}
      <PolicyModal
        type={activePolicyModal}
        onClose={() => setActivePolicyModal(null)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab as any);
          if (tab === 'shop') setSelectedCategorySlug('all');
        }}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
      />

      {/* Footer */}
      <Footer
        onOpenPolicy={(type) => setActivePolicyModal(type)}
        onSelectCategory={(slug) => {
          setSelectedCategorySlug(slug);
          setCurrentTab('shop');
        }}
        onNavigateShop={() => {
          setSelectedCategorySlug('all');
          setCurrentTab('shop');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <WishlistProvider>
            <MainApp />
          </WishlistProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
