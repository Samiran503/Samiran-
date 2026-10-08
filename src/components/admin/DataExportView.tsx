import React from 'react';
import { Download, FileSpreadsheet, ShieldCheck, Database } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  exportProductsCSV,
  exportOrdersCSV,
  exportInventoryCSV,
  exportSalesReportCSV,
  exportCustomersCSV,
} from '../../services/export';

export const DataExportView: React.FC = () => {
  const { products, orders } = useStore();

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
          Data Export & Business Reports
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Generate complete CSV reports for accounting, inventory logistics, and tax compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Products CSV */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Products Catalog Export</h3>
            <p className="text-xs text-stone-500 mt-1">
              Complete list of all active and archived products, SKUs, selling prices, and MRPs.
            </p>
          </div>
          <button
            onClick={() => exportProductsCSV(products)}
            className="mt-5 w-full bg-stone-900 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} />
            <span>Export Products CSV ({products.length})</span>
          </button>
        </div>

        {/* Orders CSV */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Customer Orders Export</h3>
            <p className="text-xs text-stone-500 mt-1">
              Full order logs, customer addresses, shipping city, state, payment modes, and order totals.
            </p>
          </div>
          <button
            onClick={() => exportOrdersCSV(orders)}
            className="mt-5 w-full bg-stone-900 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} />
            <span>Export Orders CSV ({orders.length})</span>
          </button>
        </div>

        {/* Inventory Valuation CSV */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
              <Database size={20} />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Inventory Valuation Report</h3>
            <p className="text-xs text-stone-500 mt-1">
              Stock quantities per SKU, cost valuation in ₹ INR, and low-stock replenishment indicators.
            </p>
          </div>
          <button
            onClick={() => exportInventoryCSV(products)}
            className="mt-5 w-full bg-stone-900 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} />
            <span>Export Inventory CSV</span>
          </button>
        </div>

        {/* Sales Summary Report CSV */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Sales Summary KPI Report</h3>
            <p className="text-xs text-stone-500 mt-1">
              Gross revenue, average order value (AOV), total customer discounts, and fulfillment metrics.
            </p>
          </div>
          <button
            onClick={() => exportSalesReportCSV(orders)}
            className="mt-5 w-full bg-stone-900 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} />
            <span>Export Sales Summary CSV</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200/80 text-xs text-stone-600 flex items-center gap-3">
        <ShieldCheck size={20} className="text-[#C5A059] flex-shrink-0" />
        <span>
          <strong>Data Security Guarantee:</strong> All exports are sanitized and generated client-side. Administrative passwords, private keys, and user authentication tokens are strictly excluded from all exports.
        </span>
      </div>
    </div>
  );
};
