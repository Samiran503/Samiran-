import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  MessageCircle,
  Phone,
  X,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'NEW',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'REFUNDED',
];

export const OrderManagement: React.FC = () => {
  const { orders, storeSettings, updateOrderStatus } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.orderStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
  };

  const openWhatsAppCustomer = (ord: Order) => {
    const cleanNumber = ord.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${ord.customerName}! ✨ This is Zeemba Cosmetics regarding your Order #${ord.id}. Status: ${ord.orderStatus.replace(/_/g, ' ')}.`
    );
    window.open(`https://wa.me/91${cleanNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
            Order Fulfillment Center
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Track customer orders, manage parcel status, and review payment settlements.
          </p>
        </div>

        <div className="text-xs bg-white px-3.5 py-2 rounded-xl border border-stone-200 font-semibold text-stone-800 self-start sm:self-auto">
          Total Orders: <span className="text-stone-950 font-bold">{orders.length}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Order ID, customer name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
          />
          <Search size={14} className="absolute left-2.5 top-3 text-stone-400" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-stone-50 border border-stone-200 py-2.5 px-3 rounded-xl text-stone-700 focus:outline-none font-medium cursor-pointer"
        >
          <option value="ALL">All Order Statuses</option>
          {ORDER_STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-500 font-semibold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-stone-900 block">#{ord.id}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')} •{' '}
                      {new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-stone-900">{ord.customerName}</p>
                    <p className="text-[11px] text-stone-500 font-mono">{ord.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-stone-700">
                    <span className="font-medium">{ord.city}</span>, {ord.pincode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {ord.items.slice(0, 2).map((item, iIdx) => (
                        <img
                          key={iIdx}
                          src={item.thumbnail}
                          alt={item.productName}
                          title={`${item.productName} (x${item.quantity})`}
                          className="w-7 h-7 rounded-md object-cover border border-stone-200"
                        />
                      ))}
                      {ord.items.length > 2 && (
                        <span className="text-[10px] text-stone-500 font-semibold bg-stone-100 px-1 py-0.5 rounded">
                          +{ord.items.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 block">
                      {storeSettings.currency}
                      {ord.total}
                    </span>
                    {ord.discount > 0 && (
                      <span className="text-[10px] text-emerald-600 block">
                        Saved ₹{ord.discount}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                      {ord.paymentMethod}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(ord.id, e.target.value as OrderStatus)
                      }
                      className={`text-[11px] font-bold py-1 px-2.5 rounded-full border cursor-pointer focus:outline-none ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : ord.orderStatus === 'CANCELLED'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {ORDER_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg"
                        title="View Full Invoice Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openWhatsAppCustomer(ord)}
                        className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg"
                        title="Contact Customer on WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-stone-400">
                    No orders found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details / Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">
                  Order Invoice & Dispatch
                </span>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200/80 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Customer:</span>
                <span className="font-bold text-stone-900">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Phone:</span>
                <span className="font-mono text-stone-800">{selectedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Email:</span>
                <span className="text-stone-800">{selectedOrder.email}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-200">
                <span className="text-stone-500">Delivery Address:</span>
                <span className="text-right font-medium max-w-[280px]">
                  {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} -{' '}
                  {selectedOrder.pincode}
                </span>
              </div>
              {selectedOrder.deliveryInstructions && (
                <div className="flex justify-between text-amber-700 italic">
                  <span>Note:</span>
                  <span>{selectedOrder.deliveryInstructions}</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Purchased Beauty Items
              </h4>
              <div className="divide-y divide-stone-100 text-xs">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center gap-3">
                    <img
                      src={item.thumbnail}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg object-cover border border-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 truncate">{item.productName}</p>
                      <p className="text-[11px] text-stone-400">
                        {item.variantName ? `${item.variantName} • ` : ''}Qty: {item.quantity} × ₹
                        {item.unitPrice}
                      </p>
                    </div>
                    <span className="font-bold text-stone-900">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-3.5 bg-stone-50 rounded-2xl text-xs space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({selectedOrder.couponCode || 'PROMO'}):</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-200">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => openWhatsAppCustomer(selectedOrder)}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                <span>Send WhatsApp Tracking</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
