import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Truck,
  MessageCircle,
  Tag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { trackWhatsAppClick } from '../../services/analytics';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    appliedCoupon,
    deliveryFee,
    total,
    amountNeededForFreeShipping,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { storeSettings, offers } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ text: res.message, error: !res.success });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleApplySuggestion = (code: string) => {
    const res = applyCoupon(code);
    setCouponMessage({ text: res.message, error: !res.success });
  };

  const handleWhatsAppCheckout = async () => {
    await trackWhatsAppClick('checkout', {
      itemsCount: cartCount,
      cartTotal: total,
    });
    const cleanNumber = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    const itemsList = cart
      .map(
        (item) =>
          `• ${item.product.name} (Qty: ${item.quantity}${
            item.variantName ? `, ${item.variantName}` : ''
          }) - ₹${item.totalPrice}`
      )
      .join('\n');

    const msg = encodeURIComponent(
      `Hello ${storeSettings.storeName}! ✨ I would like to place an order via WhatsApp:\n\n*Cart Items:*\n${itemsList}\n\n*Subtotal:* ₹${subtotal}\n*Discount:* ₹${discount}\n*Delivery:* ₹${deliveryFee}\n*Total:* ₹${total}\n\nPlease proceed with my shipping address and payment link!`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
  };

  // Free shipping percentage
  const freeThreshold = storeSettings.freeDeliveryThreshold || 499;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-stone-900" />
              <h2 className="text-base font-serif font-semibold text-stone-900">
                Your Beauty Bag ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#FAF8F5] px-5 py-3 border-b border-stone-200/80">
            <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1">
                <Truck size={14} className="text-[#C5A059]" />
                {amountNeededForFreeShipping > 0
                  ? `Add ${storeSettings.currency}${amountNeededForFreeShipping} more for FREE shipping`
                  : 'Congratulations! You unlocked FREE shipping! 🎉'}
              </span>
              <span className="text-[11px] font-bold text-stone-900">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#C5A059] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {cart.length > 0 ? (
              cart.map((item, idx) => (
                <div key={`${item.productId}-${item.variantId || idx}`} className="py-4 flex gap-3.5 first:pt-0">
                  <img
                    src={item.product.thumbnail || item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-stone-400 hover:text-red-500 p-0.5"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {item.variantName && (
                      <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                        {item.variantName}
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-200"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                          className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-200"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900">
                        {storeSettings.currency}
                        {item.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <ShoppingBag size={42} className="mx-auto text-stone-300 mb-3" />
                <h3 className="text-sm font-semibold text-stone-800 mb-1">
                  Your beauty bag is currently empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mb-6">
                  Explore our luxury lipsticks, saffron serums, and bridal glow combos.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-stone-900 text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-black"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-stone-200 space-y-4">
              {/* Coupon Form */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter promo coupon..."
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl uppercase font-semibold text-stone-800 focus:outline-none"
                    />
                    <Tag size={14} className="absolute left-2.5 top-2.5 text-stone-400" />
                  </div>
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-black text-white text-xs px-4 py-2 rounded-xl font-medium"
                  >
                    Apply
                  </button>
                </form>

                {couponMessage && (
                  <p
                    className={`text-[11px] mt-1.5 ${
                      couponMessage.error ? 'text-red-500' : 'text-emerald-600 font-medium'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}

                {/* Applied Coupon Pill */}
                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sparkles size={13} />
                      {appliedCoupon.couponCode} applied (-{storeSettings.currency}{discount})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-red-500 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Available Offers Suggestion */}
                {!appliedCoupon && offers.filter((o) => o.isActive).length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto text-[10px] text-stone-500">
                    <span className="font-semibold text-stone-700">Offers:</span>
                    {offers
                      .filter((o) => o.isActive)
                      .slice(0, 2)
                      .map((o) => (
                        <button
                          key={o.id}
                          onClick={() => handleApplySuggestion(o.couponCode)}
                          className="bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded text-stone-800 font-semibold uppercase"
                        >
                          {o.couponCode}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
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
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      `${storeSettings.currency}${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Total Payable</span>
                  <span className="text-base">
                    {storeSettings.currency}
                    {total}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onProceedToCheckout();
                  }}
                  className="w-full bg-stone-900 hover:bg-black text-white py-3.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Secure Checkout</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle size={16} />
                  <span>Order Bag via WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
