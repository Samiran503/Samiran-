import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, Search, Plus, Minus, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const InventoryManagement: React.FC = () => {
  const { products, storeSettings, updateStock } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Computations
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'low' && (p.stock <= 0 || p.stock > 10)) return false;
    if (stockFilter === 'out' && p.stock > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleQuickAdjust = async (productId: string, current: number, change: number) => {
    const next = Math.max(0, current + change);
    setUpdatingId(productId);
    try {
      await updateStock(productId, next);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDirectSet = async (productId: string, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setUpdatingId(productId);
    try {
      await updateStock(productId, num);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
          Warehouse & Stock Inventory
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Real-time stock control, valuation audits, and low-inventory replenishment.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Total In Stock
          </span>
          <h3 className="text-2xl font-bold text-stone-900 mt-1">{totalUnits.toLocaleString('en-IN')} units</h3>
          <p className="text-[11px] text-stone-400 mt-1">Across {products.length} catalog items</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Inventory Valuation
          </span>
          <h3 className="text-2xl font-bold text-stone-900 mt-1">
            {storeSettings.currency}
            {totalValuation.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-stone-400 mt-1">Gross cost of active inventory</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Low Stock Alerts
          </span>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount} items</h3>
          <p className="text-[11px] text-stone-400 mt-1">Stock ≤ 10 units</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Out of Stock
          </span>
          <h3 className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount} items</h3>
          <p className="text-[11px] text-stone-400 mt-1">Unavailable for ordering</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product title or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
          />
          <Search size={14} className="absolute left-2.5 top-3 text-stone-400" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              stockFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-50 border border-stone-200 text-stone-700'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              stockFilter === 'low'
                ? 'bg-amber-800 text-white'
                : 'bg-stone-50 border border-stone-200 text-stone-700'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              stockFilter === 'out'
                ? 'bg-red-700 text-white'
                : 'bg-stone-50 border border-stone-200 text-stone-700'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] text-stone-500 font-semibold uppercase tracking-wider border-b border-stone-200">
            <tr>
              <th className="py-3.5 px-4">Item</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Unit Price</th>
              <th className="py-3.5 px-4">Available Stock</th>
              <th className="py-3.5 px-4">Total Inventory Value</th>
              <th className="py-3.5 px-4 text-right">Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredProducts.map((p) => {
              const val = p.stock * p.sellingPrice;
              const isUpdating = updatingId === p.id;

              return (
                <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail || p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-100"
                      />
                      <div>
                        <p className="font-semibold text-stone-900">{p.name}</p>
                        <p className="text-[11px] text-stone-400">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600">{p.sku}</td>
                  <td className="py-3 px-4 font-medium text-stone-900">
                    {storeSettings.currency}
                    {p.sellingPrice}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.stock <= 0
                          ? 'bg-red-100 text-red-800'
                          : p.stock <= 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {storeSettings.currency}
                    {val.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleQuickAdjust(p.id, p.stock, -1)}
                        disabled={p.stock <= 0 || isUpdating}
                        className="w-7 h-7 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg flex items-center justify-center font-bold disabled:opacity-30"
                        title="Deduct 1 unit"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(p.id, p.stock, 10)}
                        disabled={isUpdating}
                        className="px-2 h-7 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg flex items-center justify-center font-bold text-[11px]"
                        title="Add 10 units"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(p.id, p.stock, 50)}
                        disabled={isUpdating}
                        className="px-2 h-7 bg-stone-900 hover:bg-black text-white rounded-lg flex items-center justify-center font-bold text-[11px]"
                        title="Batch Replenish +50"
                      >
                        +50
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
