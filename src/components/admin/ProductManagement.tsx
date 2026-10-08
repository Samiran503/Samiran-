import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Check,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';

interface ProductManagementProps {
  isAddModalOpenInitially?: boolean;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  isAddModalOpenInitially = false,
}) => {
  const { products, categories, storeSettings, addProduct, updateProduct, deleteProduct } =
    useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Zeemba Cosmetics');
  const [formCategory, setFormCategory] = useState('Makeup');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMrp, setFormMrp] = useState<number>(899);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(699);
  const [formStock, setFormStock] = useState<number>(50);
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formWeightVolume, setFormWeightVolume] = useState('30 ml');
  const [formIngredients, setFormIngredients] = useState('');
  const [formHowToUse, setFormHowToUse] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formImages, setFormImages] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  // Variants in modal
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

  // Open modal for new product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('Zeemba Cosmetics');
    setFormCategory(categories[0]?.name || 'Makeup');
    setFormSubcategory('');
    setFormShortDesc('');
    setFormDescription('');
    setFormMrp(899);
    setFormSellingPrice(699);
    setFormStock(50);
    setFormSku(`ZMB-${Date.now().toString().slice(-4)}`);
    setFormBarcode('');
    setFormWeightVolume('30 ml');
    setFormIngredients('');
    setFormHowToUse('');
    setFormTags('cosmetics, beauty, luxury');
    setFormThumbnail('https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80');
    setFormImages('');
    setFormVariants([]);
    setFormIsFeatured(false);
    setFormIsNewArrival(true);
    setFormIsBestSeller(false);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory || '');
    setFormShortDesc(p.shortDescription || '');
    setFormDescription(p.description);
    setFormMrp(p.mrp);
    setFormSellingPrice(p.sellingPrice);
    setFormStock(p.stock);
    setFormSku(p.sku);
    setFormBarcode(p.barcode || '');
    setFormWeightVolume(p.weightVolume || '');
    setFormIngredients(p.ingredients || '');
    setFormHowToUse(p.howToUse || '');
    setFormTags(p.tags?.join(', ') || '');
    setFormThumbnail(p.thumbnail);
    setFormImages(p.images?.join('\n') || '');
    setFormVariants(p.variants || []);
    setFormIsFeatured(p.isFeatured);
    setFormIsNewArrival(p.isNewArrival);
    setFormIsBestSeller(p.isBestSeller);
    setFormIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (p: Product) => {
    const dupSku = `${p.sku}-COPY`;
    await addProduct({
      ...p,
      name: `${p.name} (Copy)`,
      sku: dupSku,
      isActive: false, // Inactive by default so admin can review
    });
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteConfirmId(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formSellingPrice < 0 || formStock < 0) {
      alert('Please fill required fields with positive price and stock.');
      return;
    }

    const discountPercent =
      formMrp > formSellingPrice ? Math.round(((formMrp - formSellingPrice) / formMrp) * 100) : 0;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const imagesArray = formImages
      .split('\n')
      .map((img) => img.trim())
      .filter(Boolean);

    if (formThumbnail && !imagesArray.includes(formThumbnail)) {
      imagesArray.unshift(formThumbnail);
    }

    const payload = {
      name: formName.trim(),
      brand: formBrand.trim(),
      category: formCategory,
      subcategory: formSubcategory.trim(),
      description: formDescription.trim(),
      shortDescription: formShortDesc.trim(),
      mrp: Number(formMrp),
      sellingPrice: Number(formSellingPrice),
      discountPercent,
      stock: Number(formStock),
      sku: formSku.trim(),
      barcode: formBarcode.trim(),
      weightVolume: formWeightVolume.trim(),
      ingredients: formIngredients.trim(),
      howToUse: formHowToUse.trim(),
      tags: tagsArray,
      thumbnail: formThumbnail.trim() || imagesArray[0] || '',
      images: imagesArray,
      variants: formVariants,
      isFeatured: formIsFeatured,
      isNewArrival: formIsNewArrival,
      isBestSeller: formIsBestSeller,
      isActive: formIsActive,
      rating: editingProduct?.rating || 5.0,
      reviewCount: editingProduct?.reviewCount || 1,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }

    setIsModalOpen(false);
  };

  // Add / remove variant
  const handleAddVariant = () => {
    const newV: ProductVariant = {
      id: `v-${Date.now()}`,
      name: 'New Shade',
      shadeColor: '#C4776D',
      stock: 10,
    };
    setFormVariants([...formVariants, newV]);
  };

  const handleUpdateVariant = (idx: number, field: keyof ProductVariant, val: any) => {
    const copy = [...formVariants];
    copy[idx] = { ...copy[idx], [field]: val };
    setFormVariants(copy);
  };

  const handleRemoveVariant = (idx: number) => {
    setFormVariants(formVariants.filter((_, i) => i !== idx));
  };

  // Filtered products list
  const filtered = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900">
            Product Management
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your beauty catalog, pricing, inventory stock, and shades.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name, SKU, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
          />
          <Search size={14} className="absolute left-2.5 top-3 text-stone-400" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-stone-50 border border-stone-200 py-2.5 px-3 rounded-xl text-stone-700 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-500 font-semibold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (₹)</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.thumbnail || prod.images[0]}
                        alt={prod.name}
                        className="w-11 h-11 rounded-lg object-cover border border-stone-100 flex-shrink-0"
                      />
                      <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                        <p className="font-semibold text-stone-900 truncate">{prod.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {prod.isBestSeller && (
                            <span className="text-[9px] bg-stone-900 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                              Best Seller
                            </span>
                          )}
                          {prod.isNewArrival && (
                            <span className="text-[9px] bg-[#C5A059] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                              New
                            </span>
                          )}
                          {prod.variants && prod.variants.length > 0 && (
                            <span className="text-[10px] text-stone-400">
                              {prod.variants.length} shades
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600">{prod.sku}</td>
                  <td className="py-3 px-4 text-stone-700">{prod.category}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900">₹{prod.sellingPrice}</div>
                    {prod.mrp > prod.sellingPrice && (
                      <div className="text-[10px] text-stone-400 line-through">₹{prod.mrp}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        prod.stock <= 0
                          ? 'text-red-600'
                          : prod.stock <= 10
                          ? 'text-amber-600'
                          : 'text-stone-800'
                      }`}
                    >
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => updateProduct(prod.id, { isActive: !prod.isActive })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        prod.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {prod.isActive ? 'Active' : 'Draft / Off'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg"
                        title="Edit Product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(prod)}
                        className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg"
                        title="Duplicate Product"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(prod.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-stone-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Alert Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-stone-900">Delete Product?</h3>
            <p className="text-xs text-stone-600">
              Are you sure you want to permanently delete this item? This action will remove it from the catalog and cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold border border-stone-200 rounded-xl text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="text-base font-serif font-semibold text-stone-900">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Beauty Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Zeemba Royal Velvet Matte Lipstick"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    placeholder="e.g. Liquid Lipsticks, Face Serums"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="ZMB-LIP-001"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">MRP / Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formMrp}
                    onChange={(e) => setFormMrp(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Inventory Stock (Units) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Net Weight / Volume</label>
                  <input
                    type="text"
                    value={formWeightVolume}
                    onChange={(e) => setFormWeightVolume(e.target.value)}
                    placeholder="e.g. 30 ml, 4.2 g"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Thumbnail Image URL *</label>
                  <input
                    type="url"
                    required
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">
                    Additional Gallery Image URLs (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    placeholder="https://...&#10;https://..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Short Tagline Description</label>
                  <input
                    type="text"
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    placeholder="12-hour weightless transfer-proof matte lipstick..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Full Detailed Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Key Ingredients</label>
                  <textarea
                    rows={2}
                    value={formIngredients}
                    onChange={(e) => setFormIngredients(e.target.value)}
                    placeholder="Kashmiri Saffron, Moroccan Argan Oil, Hyaluronic Acid..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">How to Use (Application Ritual)</label>
                  <textarea
                    rows={2}
                    value={formHowToUse}
                    onChange={(e) => setFormHowToUse(e.target.value)}
                    placeholder="Dispense 2-3 drops, massage into skin..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="lipstick, matte, organic, vegan"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900">Color / Shade Variants</h4>
                    <p className="text-[11px] text-stone-500">
                      Add shade swatches with visual hex colors.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-[11px] font-semibold bg-white border border-stone-300 hover:border-stone-800 px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add Shade</span>
                  </button>
                </div>

                {formVariants.map((v, vIdx) => (
                  <div key={v.id || vIdx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                    <input
                      type="color"
                      value={v.shadeColor || '#C4776D'}
                      onChange={(e) => handleUpdateVariant(vIdx, 'shadeColor', e.target.value)}
                      className="w-8 h-8 rounded border-none cursor-pointer"
                      title="Pick shade swatch color"
                    />
                    <input
                      type="text"
                      placeholder="Shade Name (e.g. 01 Bombay Berry)"
                      value={v.name}
                      onChange={(e) => handleUpdateVariant(vIdx, 'name', e.target.value)}
                      className="flex-1 p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stock}
                      onChange={(e) => handleUpdateVariant(vIdx, 'stock', Number(e.target.value))}
                      className="w-20 p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(vIdx)}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Checkbox Badges */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-stone-900"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formIsNewArrival}
                    onChange={(e) => setFormIsNewArrival(e.target.checked)}
                    className="w-4 h-4 rounded accent-stone-900"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formIsBestSeller}
                    onChange={(e) => setFormIsBestSeller(e.target.checked)}
                    className="w-4 h-4 rounded accent-stone-900"
                  />
                  <span>Best Seller Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-stone-900"
                  />
                  <span>Published & Active in Store</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-semibold hover:bg-black transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
