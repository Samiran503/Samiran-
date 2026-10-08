import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  Percent,
  Home,
  Users,
  BarChart3,
  Download,
  Clock,
  Settings,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardOverview } from './DashboardOverview';
import { ProductManagement } from './ProductManagement';
import { CategoryManagement } from './CategoryManagement';
import { OrderManagement } from './OrderManagement';
import { InventoryManagement } from './InventoryManagement';
import { OffersManagement } from './OffersManagement';
import { HomepageCMS } from './HomepageCMS';
import { CustomerManagement } from './CustomerManagement';
import { AnalyticsView } from './AnalyticsView';
import { DataExportView } from './DataExportView';
import { ActivityLogsView } from './ActivityLogsView';
import { StoreSettingsView } from './StoreSettingsView';

interface AdminLayoutProps {
  onBackToStorefront: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStorefront }) => {
  const { currentUser, role, isAdmin, signInWithGoogle, loginWithEmail, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [initialOpenAddProduct, setInitialOpenAddProduct] = useState(false);

  // Admin login states if unauthenticated
  const [adminEmail, setAdminEmail] = useState('samiranhajong617@gmail.com');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // If not authorized admin, show Admin Authentication Gateway
  if (!isAdmin) {
    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');
      setLoginLoading(true);
      try {
        await loginWithEmail(adminEmail, adminPass);
      } catch (err: any) {
        setLoginError(err.message || 'Authentication error. Please check credentials.');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#111110] text-[#EBE5DE] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-[#1A1817] rounded-3xl p-8 border border-stone-800 shadow-2xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center mx-auto mb-3">
              <Lock size={24} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
              Zeemba Admin Portal
            </h1>
            <p className="text-xs text-stone-400">
              Role-Based Access Control (RBAC) Protected
            </p>
          </div>

          <div className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800 text-xs text-stone-300 space-y-1">
            <p className="font-semibold text-[#C5A059]">Bootstrapped Super Admin:</p>
            <p className="font-mono text-[11px] text-white">samiranhajong617@gmail.com</p>
            <p className="text-[10px] text-stone-400">
              Sign in with this Google account or authorized admin email to unlock store management.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200">
              {loginError}
            </div>
          )}

          {/* Google Sign-in */}
          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-stone-100 text-stone-900 rounded-2xl text-xs font-bold transition-all shadow-md"
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
            <span>Sign in with Google Admin</span>
          </button>

          <div className="relative text-center my-3">
            <span className="text-[11px] text-stone-500 uppercase tracking-widest">or email & password</span>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-400 mb-1">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Password</label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                required
                className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#C5A059] hover:bg-[#b58f47] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-md disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onBackToStorefront}
              className="text-xs text-stone-400 hover:text-white inline-flex items-center gap-1.5"
            >
              <span>← Return to Customer Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Products Catalog', icon: <Package size={18} /> },
    { id: 'categories', label: 'Categories', icon: <Layers size={18} /> },
    { id: 'orders', label: 'Orders & Shipping', icon: <ShoppingBag size={18} /> },
    { id: 'inventory', label: 'Inventory & Stock', icon: <Boxes size={18} /> },
    { id: 'offers', label: 'Offers & Coupons', icon: <Percent size={18} /> },
    { id: 'cms', label: 'Homepage CMS', icon: <Home size={18} /> },
    { id: 'customers', label: 'Customer Directory', icon: <Users size={18} /> },
    { id: 'analytics', label: 'Analytics & WhatsApp', icon: <BarChart3 size={18} /> },
    { id: 'exports', label: 'CSV Data Reports', icon: <Download size={18} /> },
    { id: 'logs', label: 'Admin Activity Logs', icon: <Clock size={18} /> },
    { id: 'settings', label: 'Store Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-stone-900 text-[#EBE5DE] border-r border-stone-800 flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="p-6 border-b border-stone-800">
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-[0.2em] font-medium text-white uppercase">
              ZEEMBA
            </span>
            <span className="text-[9px] tracking-[0.35em] text-[#C5A059] font-semibold uppercase -mt-0.5">
              COSMETICS ADMIN
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] text-stone-300 font-mono truncate">
              {currentUser?.email}
            </span>
          </div>
          <span className="inline-block mt-1 bg-[#C5A059]/20 text-[#C5A059] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {role}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === item.id
                  ? 'bg-[#C5A059] text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button
            onClick={onBackToStorefront}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              <span>Back to Storefront</span>
            </span>
          </button>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div className="lg:hidden bg-stone-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="p-1.5 text-stone-300 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <span className="font-serif text-base tracking-widest font-bold">ZEEMBA ADMIN</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToStorefront}
              className="text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <span>Store</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex bg-stone-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-72 bg-stone-900 text-white h-full p-5 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <span className="font-serif font-bold text-lg">Zeemba Admin</span>
                  <button onClick={() => setIsMobileDrawerOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                <nav className="mt-4 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === item.id ? 'bg-[#C5A059] text-white' : 'text-stone-400'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-stone-800">
                <button
                  onClick={onBackToStorefront}
                  className="w-full py-2.5 text-xs text-stone-300 bg-stone-800 rounded-xl"
                >
                  Exit to Storefront
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main View Router */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddProduct={() => {
                setActiveTab('products');
                setInitialOpenAddProduct(true);
              }}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagement isAddModalOpenInitially={initialOpenAddProduct} />
          )}

          {activeTab === 'categories' && <CategoryManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {activeTab === 'offers' && <OffersManagement />}
          {activeTab === 'cms' && <HomepageCMS />}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'exports' && <DataExportView />}
          {activeTab === 'logs' && <ActivityLogsView />}
          {activeTab === 'settings' && <StoreSettingsView />}
        </main>
      </div>
    </div>
  );
};
