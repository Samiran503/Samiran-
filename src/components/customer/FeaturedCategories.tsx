import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  onSelectCategory: (slug: string) => void;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ onSelectCategory }) => {
  const { categories, products } = useStore();

  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <span className="text-xs tracking-[0.25em] text-[#C5A059] uppercase font-bold">
            Curated Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1">
            Explore by Beauty Ritual
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mt-2 md:mt-0">
          From everyday velvet lips to royal skincare elixirs, crafted for your individual beauty.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {activeCategories.slice(0, 6).map((cat) => {
          const count = products.filter(
            (p) => p.category.toLowerCase() === cat.name.toLowerCase() && p.isActive
          ).length;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-800/40 hover:shadow-lg transition-all duration-300 focus:outline-none"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 bg-stone-100 ring-4 ring-[#FAF8F5] group-hover:ring-[#EAD8D0] transition-all">
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h3 className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-stone-950 line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-stone-400 mt-0.5">
                {count > 0 ? `${count} items` : 'Discover'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
