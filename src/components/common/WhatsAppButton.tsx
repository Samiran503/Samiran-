import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { trackWhatsAppClick } from '../../services/analytics';

export const WhatsAppButton: React.FC = () => {
  const { storeSettings } = useStore();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = async () => {
    await trackWhatsAppClick('general', { location: 'floating_widget' });
    const cleanNumber = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${storeSettings.storeName}! ✨ I have a question regarding your beauty products and orders.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-5 z-40 flex flex-col items-end">
      {showTooltip && (
        <div className="mb-2 bg-stone-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl max-w-xs flex items-center gap-2 border border-stone-800 animate-fadeIn">
          <span>Chat with Zeemba Beauty Advisor on WhatsApp!</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-stone-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none"
        aria-label="Contact Zeemba Cosmetics on WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle size={22} className="fill-current" />
        <span className="hidden md:inline font-medium text-sm pr-1">Beauty Help</span>
      </button>
    </div>
  );
};
