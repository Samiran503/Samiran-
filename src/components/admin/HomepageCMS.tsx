import React, { useState } from 'react';
import { Save, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const HomepageCMS: React.FC = () => {
  const { homepageContent, updateHomepageContent } = useStore();

  const [heroTitle, setHeroTitle] = useState(homepageContent.heroTitle || 'Beauty that feels like you.');
  const [heroSubtitle, setHeroSubtitle] = useState(
    homepageContent.heroSubtitle ||
      'Discover beauty essentials carefully selected for your everyday glow. Pure pigments, soothing botanicals, and Indian undertone mastery.'
  );
  const [heroCtaText, setHeroCtaText] = useState(homepageContent.heroCtaText || 'Shop the Collection');
  const [heroBannerUrl, setHeroBannerUrl] = useState(
    homepageContent.heroBannerUrl ||
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=85'
  );
  const [announcementText, setAnnouncementText] = useState(
    homepageContent.announcementText ||
      '✨ FREE EXPRESS SHIPPING ACROSS INDIA ON ALL ORDERS ABOVE ₹499 | USE CODE GLOW20 FOR 20% OFF ✨'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHomepageContent({
        heroTitle,
        heroSubtitle,
        heroCtaText,
        heroBannerUrl,
        announcementText,
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
          Homepage Content CMS
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Customize website hero copy, banners, and announcement headers in real time.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6 text-xs">
        {/* Announcement Bar */}
        <div>
          <label className="block text-stone-800 font-semibold mb-1 uppercase tracking-wider text-[11px]">
            Top Announcement Bar Banner
          </label>
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium"
          />
        </div>

        {/* Hero Section */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <h3 className="text-sm font-bold text-stone-900 font-serif">Hero Section Content</h3>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Hero Main Title Headline</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-serif text-base"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Hero Supporting Subtitle</label>
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">CTA Button Text</label>
              <input
                type="text"
                value={heroCtaText}
                onChange={(e) => setHeroCtaText(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Hero Banner Image URL</label>
              <input
                type="url"
                value={heroBannerUrl}
                onChange={(e) => setHeroBannerUrl(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          {/* Hero Banner Image Preview */}
          {heroBannerUrl && (
            <div className="pt-2">
              <span className="block text-stone-500 mb-1 text-[11px]">Current Hero Image Preview:</span>
              <div className="h-44 rounded-2xl overflow-hidden border border-stone-200 max-w-md bg-stone-100">
                <img src={heroBannerUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        {/* Save CTA */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
          {savedSuccess && (
            <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
              <Check size={16} />
              Homepage content successfully updated!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Homepage Content'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
