import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  Truck,
  CreditCard,
  Banknote,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { trackWhatsAppClick } from '../../services/analytics';
import { OrderItem } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted?: (orderId: string) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const { cart, subtotal, discount, appliedCoupon, deliveryFee, total, clearCart } = useCart();
  const { placeOrder, storeSettings } = useStore();
  const { currentUser, userProfile } = useAuth();

  // Form states
  const [fullName, setFullName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE' | 'WHATSAPP'>('COD');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Validations
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setErrorMsg('Please enter your detailed street address.');
      return;
    }
    const cleanPin = pincode.replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setSubmitting(true);

    try {
      const orderItems: OrderItem[] = cart.map((c) => ({
        productId: c.productId,
        productName: c.product.name,
        brand: c.product.brand,
        thumbnail: c.product.thumbnail || c.product.images[0],
        variantName: c.variantName,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        totalPrice: c.totalPrice,
      }));

      const newOrderId = await placeOrder({
        customerId: currentUser?.uid,
        customerName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim(),
        address: address.trim(),
        city: city.trim() || 'Bangalore',
        state: state,
        pincode: cleanPin,
        deliveryInstructions: deliveryInstructions.trim(),
        items: orderItems,
        subtotal,
        discount,
        couponCode: appliedCoupon?.couponCode,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'COD_PENDING',
        orderStatus: 'NEW',
        isWhatsAppOrder: paymentMethod === 'WHATSAPP',
      });

      setPlacedOrderId(newOrderId);
      clearCart();

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A059', '#D9737C', '#1C1917', '#EAD8D0'],
        });
      } catch {}

      if (paymentMethod === 'WHATSAPP') {
        await trackWhatsAppClick('checkout', { orderId: newOrderId, total });
        const cleanNumber = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(
          `Hello ${storeSettings.storeName}! ✨ I just placed Order #${newOrderId} for ₹${total}.\n\nName: ${fullName}\nPhone: ${cleanPhone}\nAddress: ${address}, ${city}, ${state} - ${cleanPin}\n\nPlease send tracking confirmation!`
        );
        window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
      }

      if (onOrderCompleted) {
        onOrderCompleted(newOrderId);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to place order. Please check stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#C5A059]" />
            <div>
              <h2 className="text-base font-serif font-semibold text-stone-900">
                {placedOrderId ? 'Order Confirmed!' : 'Secure Checkout'}
              </h2>
              <p className="text-[11px] text-stone-500">256-Bit SSL Encrypted & Protected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7">
          {placedOrderId ? (
            /* Order Placed Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                  Thank You for Shopping with Zeemba
                </span>
                <h3 className="text-2xl font-serif font-medium text-stone-900 mt-1">
                  Your Beauty Order is Confirmed!
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Order ID:{' '}
                  <span className="font-mono font-bold text-stone-800">{placedOrderId}</span>
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between font-semibold text-stone-900">
                  <span>Total Amount Paid / Payable:</span>
                  <span>
                    {storeSettings.currency}
                    {total}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Payment Mode:</span>
                  <span className="capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping Address:</span>
                  <span className="text-right truncate max-w-[200px]">
                    {address}, {city} - {pincode}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 text-emerald-700 font-medium flex items-center gap-1.5">
                  <Truck size={14} />
                  <span>Estimated delivery in 2-4 business days.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-stone-900 text-white text-xs font-semibold px-8 py-3 rounded-full hover:bg-black transition-colors"
                >
                  Continue Shopping
                </button>

                <button
                  onClick={() => {
                    const cleanNumber = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
                    window.open(
                      `https://wa.me/${cleanNumber}?text=Hi,%20I%20want%20to%20track%20my%20Order%20${placedOrderId}`,
                      '_blank'
                    );
                  }}
                  className="w-full sm:w-auto bg-[#25D366] text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-[#20bd5a] flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={16} />
                  <span>Track on WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Delivery Address Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-1.5">
                  <span>1. Shipping Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ananya Sen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">
                      Mobile Number (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 mb-1 font-medium">Email Address *</label>
                    <input
                      type="email"
                      placeholder="ananya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 mb-1 font-medium">
                      Flat / House / Street Address *
                    </label>
                    <input
                      type="text"
                      placeholder="Flat 402, Royal Palms, 12th Main"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">City *</label>
                    <input
                      type="text"
                      placeholder="Bangalore / Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">PIN Code (6 Digits) *</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="560001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave with security, call before"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3">
                  2. Select Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* COD */}
                  <label
                    className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="sr-only"
                    />
                    <Banknote size={20} className="mb-1.5" />
                    <span className="font-bold">Cash on Delivery</span>
                    <span className={`text-[10px] ${paymentMethod === 'COD' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Pay cash or UPI on delivery
                    </span>
                  </label>

                  {/* Online UPI / Cards */}
                  <label
                    className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="sr-only"
                    />
                    <CreditCard size={20} className="mb-1.5" />
                    <span className="font-bold">UPI / Cards / NetBanking</span>
                    <span className={`text-[10px] ${paymentMethod === 'ONLINE' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Instant zero-touch payment
                    </span>
                  </label>

                  {/* WhatsApp Order */}
                  <label
                    className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'WHATSAPP'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'WHATSAPP'}
                      onChange={() => setPaymentMethod('WHATSAPP')}
                      className="sr-only"
                    />
                    <MessageCircle size={20} className="mb-1.5 text-[#25D366]" />
                    <span className="font-bold">Order via WhatsApp</span>
                    <span className={`text-[10px] ${paymentMethod === 'WHATSAPP' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Confirm & pay via chat
                    </span>
                  </label>
                </div>
              </div>

              {/* Order Items Review Strip */}
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200 text-xs space-y-2">
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal ({cart.length})</span>
                  <span>
                    {storeSettings.currency}
                    {subtotal}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Savings</span>
                    <span>
                      -{storeSettings.currency}
                      {discount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Express Shipping</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `${storeSettings.currency}${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-200">
                  <span>Total Payable</span>
                  <span className="text-base text-stone-900 font-bold">
                    {storeSettings.currency}
                    {total}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-stone-900 hover:bg-black text-white py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Placing Order...' : `Place Order — ₹${total}`}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
