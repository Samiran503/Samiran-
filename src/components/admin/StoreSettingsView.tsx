import React, { useState } from 'react';
import { Save, Check, Settings, ShieldCheck, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const StoreSettingsView: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();

  const [storeName, setStoreName] = useState(storeSettings.storeName || 'ZEEMBA COSMETICS');
  const [tagline, setTagline] = useState(storeSettings.tagline || 'Beauty that feels like you.');
  const [supportEmail, setSupportEmail] = useState(storeSettings.supportEmail || 'support@zeembacosmetics.com');
  const [supportPhone, setSupportPhone] = useState(storeSettings.supportPhone || '+91 98765 43210');
  const [whatsappNumber, setWhatsappNumber] = useState(storeSettings.whatsappNumber || '919876543210');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(storeSettings.freeDeliveryThreshold || 499);
  const [deliveryFee, setDeliveryFee] = useState<number>(storeSettings.deliveryFee || 49);
  const [address, setAddress] = useState(storeSettings.address || 'Zeemba Cosmetics House, MG Road, Bangalore, Karnataka - 560001, India');
  const [instagramUrl, setInstagramUrl] = useState(storeSettings.instagramUrl || 'https://instagram.com/zeembacosmetics');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreSettings({
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        supportEmail: supportEmail.trim(),
        supportPhone: supportPhone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        freeDeliveryThreshold: Number(freeDeliveryThreshold),
        deliveryFee: Number(deliveryFee),
        address: address.trim(),
        instagramUrl: instagramUrl.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
          Store & Contact Configuration
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure business contact details, delivery fee rules, and WhatsApp support number.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Brand Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Customer Helpline Phone</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              WhatsApp Business Number (with country code, no +)
            </label>
            <div className="relative">
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="919876543210"
                className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold"
              />
              <MessageCircle size={14} className="absolute left-2.5 top-3 text-[#25D366]" />
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Format: 91 followed by 10-digit number (e.g. 919876543210)
            </span>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Instagram Profile URL</label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Free Express Delivery Threshold (₹)
            </label>
            <input
              type="number"
              min={0}
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
            />
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Orders equal to or above this amount get free shipping.
            </span>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Standard Shipping Fee (₹)
            </label>
            <input
              type="number"
              min={0}
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
            />
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Charged when cart value is below the free delivery threshold.
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-700 font-semibold mb-1">
              Registered Head Office / Store Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
          {savedSuccess && (
            <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
              <Check size={16} />
              Store settings successfully saved!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
