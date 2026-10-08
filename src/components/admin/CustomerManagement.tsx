import React, { useEffect, useState } from 'react';
import { Users, Search, ShoppingBag, Mail, Phone, Calendar } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useStore } from '../../context/StoreContext';
import { UserProfile } from '../../types';

export const CustomerManagement: React.FC = () => {
  const { orders, storeSettings } = useStore();

  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const q = query(collection(db, 'users'), limit(100));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => d.data() as UserProfile);
        setCustomers(list);
      } catch (err) {
        console.warn('Customer list query notice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.email.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
            Customer Directory
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Registered beauty lovers, order histories, and lifetime value insights.
          </p>
        </div>

        <div className="text-xs bg-white px-3.5 py-2 rounded-xl border border-stone-200 font-semibold text-stone-800 self-start sm:self-auto">
          Total Registered: <span className="text-stone-950 font-bold">{customers.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
          />
          <Search size={14} className="absolute left-2.5 top-3 text-stone-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] text-stone-500 font-semibold uppercase tracking-wider border-b border-stone-200">
            <tr>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Orders Placed</th>
              <th className="py-3.5 px-4">Lifetime Spend</th>
              <th className="py-3.5 px-4 text-right">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((c) => {
              const userOrders = orders.filter(
                (o) => o.customerId === c.userId || o.email === c.email
              );
              const totalSpend = userOrders.reduce(
                (sum, o) => sum + (o.orderStatus !== 'CANCELLED' ? o.total : 0),
                0
              );

              return (
                <tr key={c.userId} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 font-bold flex items-center justify-center text-xs">
                        {c.name?.charAt(0) || c.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{c.name || 'Zeemba User'}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{c.userId.slice(0, 12)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-stone-800">{c.email}</p>
                    <p className="text-[11px] text-stone-400">{c.phone || 'No phone provided'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                      {c.role || 'CUSTOMER'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-800 font-semibold">
                    {userOrders.length} orders
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {storeSettings.currency}
                    {totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-stone-400 font-mono text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-stone-400">
                  No customers found. Customers who register or checkout appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
