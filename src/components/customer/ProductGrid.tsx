import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, X, Search, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { useStore } from '../../context/StoreContext';

interface ProductGridProps {
  initialCategory?: string;
  onOpenProductDetails: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  initialCategory,
  onOpenProductDetails,
}) => {
  const { products, categories, storeSettings } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Sync category if initialCategory changes
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Active check
        if (!p.isActive) return false;

        // Category filter
        if (selectedCategory !== 'all') {
          const matchCat =
            p.category.toLowerCase() === selectedCategory.toLowerCase() ||
            categories.some(
              (c) =>
                c.slug.toLowerCase() === selectedCategory.toLowerCase() &&
                c.name.toLowerCase() === p.category.toLowerCase()
            );
          if (!matchCat) return false;
        }

        // In-stock filter
        if (inStockOnly && p.stock <= 0) return false;

        // Price filter
        if (p.sellingPrice > maxPrice) return false;

        // Discount filter
        if (p.discountPercent < minDiscount) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchTags && !matchSku) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'price_asc') return a.sellingPrice - b.sellingPrice;
        if (selectedSort === 'price_desc') return b.sellingPrice - a.sellingPrice;
        if (selectedSort === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        if (selectedSort === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (selectedSort === 'popular') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        // Default: featured
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    products,
    categories,
    selectedCategory,
    selectedSort,
    inStockOnly,
    maxPrice,
    minDiscount,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSort('featured');
    setInStockOnly(false);
    setMaxPrice(4000);
    setMinDiscount(0);
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    inStockOnly ||
    maxPrice < 4000 ||
    minDiscount > 0 ||
    searchQuery.trim() !== '';

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search & Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 font-medium">
            {selectedCategory === 'all'
              ? 'All Beauty Collections'
              : categories.find((c) => c.slug === selectedCategory || c.name === selectedCategory)
                  ?.name || selectedCategory}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Showing {filteredProducts.length} curated beauty essentials
          </p>
        </div>

        {/* Top Controls: Search Bar & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
            />
            <Search size={14} className="absolute left-2.5 top-3 text-stone-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="text-xs bg-white border border-stone-200 py-2.5 px-3 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="popular">Best Sellers</option>
            <option value="newest">New Arrivals</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden p-2.5 bg-white border border-stone-200 rounded-xl text-stone-700 hover:text-black flex items-center gap-1.5 text-xs font-semibold"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#C5A059] hover:underline font-medium"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Category List */}
          <div>
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
              Category
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-stone-900 text-white font-medium'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                All Categories ({products.filter((p) => p.isActive).length})
              </button>
              {categories
                .filter((c) => c.isActive)
                .map((cat) => {
                  const count = products.filter(
                    (p) => p.category.toLowerCase() === cat.name.toLowerCase() && p.isActive
                  ).length;
                  const isSelected =
                    selectedCategory.toLowerCase() === cat.slug.toLowerCase() ||
                    selectedCategory.toLowerCase() === cat.name.toLowerCase();

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-stone-900 text-white font-medium'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              <span>Max Price</span>
              <span className="text-stone-900 font-bold">
                {storeSettings.currency}
                {maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="4000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-stone-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>₹300</span>
              <span>₹4,000+</span>
            </div>
          </div>

          {/* Min Discount */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Minimum Discount
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[0, 15, 20, 25].map((d) => (
                <button
                  key={d}
                  onClick={() => setMinDiscount(d)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    minDiscount === d
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {d === 0 ? 'All' : `${d}%+`}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-stone-900 focus:ring-0 accent-stone-900"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="md:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetails={onOpenProductDetails}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
              <Sparkles size={36} className="mx-auto text-[#C5A059] mb-3 opacity-80" />
              <h3 className="text-lg font-serif font-medium text-stone-900 mb-1">
                No beauty items match your filter criteria
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                Try widening your price limit or clearing active search keywords to view all collections.
              </p>
              <button
                onClick={resetFilters}
                className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-serif font-medium text-stone-900">Filter Products</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-stone-500 hover:text-stone-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-2">
                <span>Max Price</span>
                <span>₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="300"
                max="4000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-stone-900"
              />
            </div>

            {/* In stock */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 rounded"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 text-xs font-semibold border border-stone-200 rounded-xl text-stone-700"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 text-xs font-semibold bg-stone-900 text-white rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
