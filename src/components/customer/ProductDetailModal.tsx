import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Star,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { Product, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { trackWhatsAppClick, trackEvent } from '../../services/analytics';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCheckoutDirect?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCheckoutDirect,
}) => {
  if (!product) return null;

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { storeSettings, fetchProductReviews, submitReview } = useStore();
  const { currentUser } = useAuth();

  const [activeImage, setActiveImage] = useState<string>(product.thumbnail || product.images[0] || '');
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'howTo' | 'shipping'>('desc');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Write review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.thumbnail || product.images[0] || '');
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
      setQuantity(1);
      trackEvent('product_view', { productId: product.id, name: product.name, price: product.sellingPrice });

      // Fetch reviews
      setLoadingReviews(true);
      fetchProductReviews(product.id)
        .then((revs) => setReviews(revs))
        .finally(() => setLoadingReviews(false));
    }
  }, [product]);

  const inWish = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant?.id, selectedVariant?.name);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant?.id, selectedVariant?.name);
    setIsCartOpen(false);
    if (onOpenCheckoutDirect) {
      onClose();
      onOpenCheckoutDirect();
    }
  };

  const handleWhatsAppOrder = async () => {
    await trackWhatsAppClick('product', {
      productId: product.id,
      productName: product.name,
      variant: selectedVariant?.name || 'Standard',
      price: product.sellingPrice,
    });
    const cleanNumber = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    const variantText = selectedVariant ? ` (Shade/Size: ${selectedVariant.name})` : '';
    const message = encodeURIComponent(
      `Hello ${storeSettings.storeName}! 🛍️ I want to order:\n\n*${product.name}*${variantText}\nPrice: ₹${product.sellingPrice} (Qty: ${quantity})\nSKU: ${product.sku}\n\nPlease confirm availability and payment details!`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      await submitReview({
        productId: product.id,
        customerId: currentUser?.uid || 'guest-reviewer',
        customerName: reviewerName.trim() || currentUser?.displayName || 'Beauty Lover',
        rating: newRating,
        comment: newComment.trim(),
        isVerifiedPurchase: true,
      });
      setReviewSubmitted(true);
      setNewComment('');
      // Refresh reviews
      const updated = await fetchProductReviews(product.id);
      setReviews(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Zeemba Cosmetics!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-stone-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 text-stone-600 hover:text-stone-950 shadow-md hover:scale-105 transition-all"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Gallery Column */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-[#D9737C] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage === img
                          ? 'border-stone-900 ring-2 ring-stone-900/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Column */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 uppercase tracking-widest font-semibold mb-1">
                  <span>{product.brand}</span>
                  <span className="text-stone-400">SKU: {product.sku}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-[#C5A059]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={
                          star <= Math.round(product.rating || 5)
                            ? 'fill-[#C5A059]'
                            : 'text-stone-200'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.rating || 4.9}
                  </span>
                  <span className="text-xs text-stone-400">
                    ({product.reviewCount || 12} reviews)
                  </span>
                </div>
              </div>

              {/* Price Block */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200/60 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-stone-900">
                      {storeSettings.currency}
                      {product.sellingPrice}
                    </span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-sm text-stone-400 line-through">
                        {storeSettings.currency}
                        {product.mrp}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Inclusive of all taxes & duties.
                  </span>
                </div>
                {product.mrp > product.sellingPrice && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    Save {storeSettings.currency}
                    {product.mrp - product.sellingPrice}
                  </span>
                )}
              </div>

              {/* Variants / Shades Selector */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Select Shade / Option:{' '}
                    <span className="text-stone-900 font-bold lowercase first-letter:uppercase">
                      {selectedVariant?.name}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {v.shadeColor && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/50"
                            style={{ backgroundColor: v.shadeColor }}
                          />
                        )}
                        <span>{v.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Stock Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 text-sm font-semibold disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-semibold text-stone-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 text-sm font-semibold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs">
                  {isOutOfStock ? (
                    <span className="text-red-600 font-bold">Out of Stock</span>
                  ) : product.stock <= 5 ? (
                    <span className="text-amber-600 font-semibold">
                      Only {product.stock} items remaining in stock
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">In Stock — Ready to dispatch</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white py-3.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-40"
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2 bg-[#C5A059] hover:bg-[#b58f47] text-white py-3.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-40"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* WhatsApp Order Button */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-sm hover:shadow"
                >
                  <MessageCircle size={18} />
                  <span>Order via WhatsApp (Instant Confirmation)</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
                  >
                    <Heart
                      size={16}
                      className={inWish ? 'fill-[#D9737C] text-[#D9737C]' : ''}
                    />
                    <span>{inWish ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100 text-center text-[10px] text-stone-500">
                <div className="flex flex-col items-center">
                  <Truck size={16} className="text-stone-700 mb-1" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck size={16} className="text-stone-700 mb-1" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw size={16} className="text-stone-700 mb-1" />
                  <span>Easy 7-Day Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Accordion / Tabs: Description, Ingredients, How to Use */}
          <div className="mt-10 pt-6 border-t border-stone-200">
            <div className="flex border-b border-stone-200 gap-6 text-sm font-semibold text-stone-500 overflow-x-auto">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-3 transition-colors ${
                  activeTab === 'desc'
                    ? 'border-b-2 border-stone-900 text-stone-900'
                    : 'hover:text-stone-800'
                }`}
              >
                Description
              </button>
              {product.ingredients && (
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-3 transition-colors ${
                    activeTab === 'ingredients'
                      ? 'border-b-2 border-stone-900 text-stone-900'
                      : 'hover:text-stone-800'
                  }`}
                >
                  Key Ingredients
                </button>
              )}
              {product.howToUse && (
                <button
                  onClick={() => setActiveTab('howTo')}
                  className={`pb-3 transition-colors ${
                    activeTab === 'howTo'
                      ? 'border-b-2 border-stone-900 text-stone-900'
                      : 'hover:text-stone-800'
                  }`}
                >
                  How to Use
                </button>
              )}
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-3 transition-colors ${
                  activeTab === 'shipping'
                    ? 'border-b-2 border-stone-900 text-stone-900'
                    : 'hover:text-stone-800'
                }`}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="py-5 text-xs sm:text-sm text-stone-600 leading-relaxed">
              {activeTab === 'desc' && (
                <p className="whitespace-pre-line">{product.description}</p>
              )}
              {activeTab === 'ingredients' && (
                <div>
                  <p className="font-semibold text-stone-800 mb-1">Pure Ayurvedic Botanicals & Actives:</p>
                  <p className="whitespace-pre-line">{product.ingredients}</p>
                </div>
              )}
              {activeTab === 'howTo' && (
                <div>
                  <p className="font-semibold text-stone-800 mb-1">Application Ritual:</p>
                  <p className="whitespace-pre-line">{product.howToUse}</p>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-2">
                  <p>• Dispatch within 24 hours from Bangalore logistics center.</p>
                  <p>• Free express shipping on prepaid & COD orders above ₹{storeSettings.freeDeliveryThreshold}.</p>
                  <p>• 7-day hassle-free returns for damaged, defective, or incorrect items received.</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-8 pt-8 border-t border-stone-200">
            <h3 className="text-lg font-serif text-stone-900 font-semibold mb-4">
              Customer Reviews ({reviews.length})
            </h3>

            {/* Write Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-4 bg-stone-50 rounded-2xl mb-6">
              <h4 className="text-xs uppercase tracking-wider font-bold text-stone-700 mb-3">
                Leave a Verified Review
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Your Rating</label>
                  <div className="flex gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="text-stone-300 hover:text-[#C5A059] transition-colors"
                      >
                        <Star
                          size={18}
                          className={star <= newRating ? 'fill-[#C5A059] text-[#C5A059]' : ''}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] text-stone-500 mb-1">Your Review</label>
                <textarea
                  rows={2}
                  placeholder="Share your experience with texture, finish, and longevity..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                />
              </div>

              <div className="flex items-center justify-between">
                {reviewSubmitted && (
                  <span className="text-xs text-emerald-700 font-medium">
                    ✓ Thank you! Your review has been recorded.
                  </span>
                )}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="ml-auto bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-black transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3 bg-white border border-stone-200/80 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">{r.customerName}</span>
                      <div className="flex text-[#C5A059]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={s <= r.rating ? 'fill-[#C5A059]' : 'text-stone-200'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600">{r.comment}</p>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')} • Verified Purchase
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                Be the first to share your experience with {product.name}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
