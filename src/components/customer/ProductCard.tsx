import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { storeSettings } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const inWish = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const displayImage =
    isHovered && product.images && product.images.length > 1
      ? product.images[1]
      : product.thumbnail || (product.images && product.images[0]) || '';

  return (
    <div
      onClick={() => onOpenDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/70 hover:border-stone-800/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.isBestSeller && (
            <span className="bg-[#1C1917] text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-md shadow-sm">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#C5A059] text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-md shadow-sm">
              New Arrival
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-[#D9737C] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-stone-700 hover:text-[#D9737C] shadow-sm hover:scale-110 transition-all focus:outline-none"
          aria-label={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={18}
            className={inWish ? 'fill-[#D9737C] text-[#D9737C]' : 'text-stone-600'}
          />
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-stone-900 text-white text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] text-stone-500 mb-1">
            <span className="uppercase tracking-wider font-medium truncate">
              {product.brand}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1 text-stone-800 font-semibold">
                <Star size={12} className="fill-[#C5A059] text-[#C5A059]" />
                <span>{product.rating}</span>
                {product.reviewCount && (
                  <span className="text-stone-400">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          <h3 className="text-sm font-medium text-stone-900 line-clamp-2 leading-snug group-hover:text-stone-700 transition-colors">
            {product.name}
          </h3>

          {/* Variants / Swatch preview dots */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {product.variants.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="w-3.5 h-3.5 rounded-full border border-white shadow-sm ring-1 ring-stone-300"
                  style={{ backgroundColor: v.shadeColor || '#C4776D' }}
                  title={v.name}
                />
              ))}
              {product.variants.length > 4 && (
                <span className="text-[10px] text-stone-400 font-medium">
                  +{product.variants.length - 4} shades
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-stone-900">
                {storeSettings.currency}
                {product.sellingPrice}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-xs text-stone-400 line-through">
                  {storeSettings.currency}
                  {product.mrp}
                </span>
              )}
            </div>
            {isLowStock && (
              <span className="block text-[10px] text-amber-600 font-medium">
                Only {product.stock} left in stock!
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 hover:bg-black text-white hover:scale-105 shadow-sm'
            }`}
            aria-label="Add to cart"
          >
            {addedAnimation ? <Check size={16} /> : <ShoppingBag size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
