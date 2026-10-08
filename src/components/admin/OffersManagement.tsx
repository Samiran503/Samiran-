import React, { useState } from 'react';
import { Plus, Tag, Edit2, Trash2, X, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Offer } from '../../types';

export const OffersManagement: React.FC = () => {
  const { offers, storeSettings, addOffer, updateOffer, deleteOffer } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [title, setTitle] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(499);
  const [maxDiscount, setMaxDiscount] = useState<number>(300);
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setTitle('Festive Season Discount');
    setCouponCode('FESTIVE15');
    setDescription('Get 15% off on your luxury beauty haul.');
    setDiscountType('PERCENTAGE');
    setDiscountValue(15);
    setMinOrderValue(799);
    setMaxDiscount(400);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (o: Offer) => {
    setEditingOffer(o);
    setTitle(o.title);
    setCouponCode(o.couponCode);
    setDescription(o.description || '');
    setDiscountType(o.discountType);
    setDiscountValue(o.discountValue);
    setMinOrderValue(o.minOrderValue);
    setMaxDiscount(o.maxDiscount || 500);
    setIsActive(o.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !couponCode.trim()) return;

    const payload = {
      title: title.trim(),
      couponCode: couponCode.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: discountType === 'PERCENTAGE' ? Number(maxDiscount) : undefined,
      isActive,
    };

    if (editingOffer) {
      await updateOffer(editingOffer.id, payload);
    } else {
      await addOffer(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      await deleteOffer(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
            Promotional Offers & Coupons
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Create coupon codes, percentage discounts, and minimum order incentives.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] text-stone-500 font-semibold uppercase tracking-wider border-b border-stone-200">
            <tr>
              <th className="py-3.5 px-4">Coupon Code</th>
              <th className="py-3.5 px-4">Offer Campaign</th>
              <th className="py-3.5 px-4">Discount</th>
              <th className="py-3.5 px-4">Min. Cart Value</th>
              <th className="py-3.5 px-4">Max Discount Cap</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {offers.map((o) => (
              <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {o.couponCode}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-stone-900">{o.title}</p>
                  <p className="text-[11px] text-stone-400">{o.description}</p>
                </td>
                <td className="py-3 px-4 font-bold text-stone-900">
                  {o.discountType === 'PERCENTAGE'
                    ? `${o.discountValue}% OFF`
                    : `₹${o.discountValue} FLAT`}
                </td>
                <td className="py-3 px-4 text-stone-700">₹{o.minOrderValue}</td>
                <td className="py-3 px-4 text-stone-700">
                  {o.maxDiscount ? `₹${o.maxDiscount}` : 'No cap'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      o.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {o.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(o)}
                      className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(o.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-base font-serif font-bold text-stone-900">
                {editingOffer ? 'Edit Offer Coupon' : 'Create Offer Coupon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GLOW20"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl uppercase font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Glow Festival 20% Off"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Rupee Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Min. Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Offer details shown to customer..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-stone-900"
                  />
                  <span>Active & Redeemable in Bag</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-black"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
