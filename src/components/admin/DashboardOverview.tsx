import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  Eye,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddProduct: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenAddProduct,
}) => {
  const { products, orders, categories, adminLogs, storeSettings, seedDatabaseIfNeeded } =
    useStore();

  // Metrics Calculations
  const nonCancelledOrders = orders.filter((o) => o.orderStatus !== 'CANCELLED');
  const totalRevenue = nonCancelledOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) =>
    ['NEW', 'CONFIRMED', 'PROCESSING'].includes(o.orderStatus)
  ).length;

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  // Today's Orders & Revenue
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayRevenue = todayOrders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((acc, o) => acc + o.total, 0);

  // WhatsApp orders
  const whatsAppOrders = orders.filter((o) => o.paymentMethod === 'WHATSAPP' || o.isWhatsAppOrder).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">
            Store Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-medium mt-1">
            Zeemba Cosmetics Live Overview
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Real-time orders, catalog inventory, and customer conversion tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenAddProduct}
            className="bg-[#C5A059] hover:bg-[#b58f47] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>

          <button
            onClick={() => seedDatabaseIfNeeded()}
            className="border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-medium px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Ensure cloud catalog is seeded with full Zeemba collection"
          >
            <RefreshCw size={14} />
            <span>Sync Cloud Catalog</span>
          </button>
        </div>
      </div>

      {/* Key Metric KPI Cards (Today & Overall) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-stone-900">
              {storeSettings.currency}
              {totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-stone-400 mt-1">
              Today: {storeSettings.currency}
              {todayRevenue.toLocaleString('en-IN')} ({todayOrders.length} orders)
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-stone-900">{totalOrders}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              {pendingOrders} orders require packing/dispatch
            </p>
          </div>
        </div>

        {/* Catalog & Inventory */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Products</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-stone-900">{products.length}</h3>
            <p className="text-[11px] text-stone-500 mt-1">
              {categories.length} active categories in shop
            </p>
          </div>
        </div>

        {/* WhatsApp Conversions */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">WhatsApp Orders</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#25D366] flex items-center justify-center">
              <MessageCircle size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-stone-900">{whatsAppOrders}</h3>
            <p className="text-[11px] text-stone-500 mt-1">Direct conversational checkout</p>
          </div>
        </div>
      </div>

      {/* Stock Alerts & Low Stock Warning Strip */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Inventory Alerts
              </h4>
              <p className="text-xs text-amber-800">
                {outOfStockProducts.length} items out of stock • {lowStockProducts.length} items low
                in stock (≤ 10 units)
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* Middle Row: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              Recent Customer Orders
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-[#C5A059] hover:underline font-semibold"
            >
              View All ({orders.length}) →
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {orders.slice(0, 5).map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-900">
                    {ord.customerName}{' '}
                    <span className="font-normal text-stone-400">({ord.city})</span>
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    #{ord.id} • {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 block">
                    {storeSettings.currency}
                    {ord.total}
                  </span>
                  <span
                    className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      ord.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.orderStatus}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="py-6 text-center text-xs text-stone-400 italic">No orders received yet.</p>
            )}
          </div>
        </div>

        {/* Top Products / Catalog Snapshot */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              Featured Catalog Items
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-[#C5A059] hover:underline font-semibold"
            >
              Manage Catalog →
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {products.slice(0, 5).map((prod) => (
              <div key={prod.id} className="py-3 flex items-center gap-3 text-xs">
                <img
                  src={prod.thumbnail || prod.images[0]}
                  alt={prod.name}
                  className="w-10 h-10 rounded-lg object-cover border border-stone-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 truncate">{prod.name}</p>
                  <p className="text-stone-400 text-[11px]">{prod.category} • SKU: {prod.sku}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 block">
                    {storeSettings.currency}
                    {prod.sellingPrice}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      prod.stock <= 5 ? 'text-red-500' : 'text-stone-500'
                    }`}
                  >
                    {prod.stock} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Audit Trail Preview */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-stone-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              Latest Admin Security Audit Trail
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('logs')}
            className="text-xs text-[#C5A059] hover:underline font-semibold"
          >
            All Logs ({adminLogs.length}) →
          </button>
        </div>

        <div className="space-y-2">
          {adminLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-stone-800">{log.action}: </span>
                <span className="text-stone-600">{log.details}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono flex-shrink-0 ml-4">
                {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
          {adminLogs.length === 0 && (
            <p className="text-xs text-stone-400 italic py-2">
              All administrator actions are logged here for full audit compliance.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
