import React from 'react';
import { X, ShieldCheck, Truck, RotateCcw, HelpCircle, FileText, Mail } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface PolicyModalProps {
  type: 'about' | 'shipping' | 'returns' | 'privacy' | 'terms' | 'faq' | 'contact' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const { storeSettings } = useStore();

  const getTitleAndContent = () => {
    switch (type) {
      case 'about':
        return {
          title: 'About Zeemba Cosmetics',
          icon: <ShieldCheck size={22} className="text-[#C5A059]" />,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                <strong>ZEEMBA COSMETICS</strong> was founded with a singular, unapologetic philosophy: <em>"Beauty that feels like you."</em>
              </p>
              <p>
                For generations, mainstream beauty forced Indian skin into rigid boxes—formulas that left ashy white casts, textures that melted under tropical humidity, or harsh chemicals that compromised long-term skin health.
              </p>
              <p>
                We set out to change this. Combining ancestral botanical wisdom (Kashmiri Mongra saffron, Kannauj Damask rose, organic castor oil) with clinically tested dermatological actives (ceramides, squalane, niacinamide), Zeemba delivers high-pigment, long-wearing cosmetic excellence made specifically for Indian undertones.
              </p>
              <p>
                Every product is 100% cruelty-free, vegan, ethically sourced, and manufactured adhering to rigorous Indian FDA cosmetic standards.
              </p>
            </div>
          ),
        };

      case 'shipping':
        return {
          title: 'Shipping & Delivery Policy',
          icon: <Truck size={22} className="text-[#C5A059]" />,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                <strong>Dispatch Timeline:</strong> All orders are dispatched within 24 hours of placement from our temperature-controlled facility in Bangalore.
              </p>
              <p>
                <strong>Delivery Timelines:</strong>
                <br />• Metro Cities (Bangalore, Mumbai, Delhi NCR, Hyderabad, Chennai, Kolkata): 2-3 Business Days.
                <br />• Rest of India: 3-5 Business Days.
                <br />• Remote / North-East regions: 4-6 Business Days.
              </p>
              <p>
                <strong>Shipping Charges:</strong>
                <br />• FREE express delivery on all orders above ₹{storeSettings.freeDeliveryThreshold}.
                <br />• Standard delivery fee of ₹{storeSettings.deliveryFee} applies on orders below ₹{storeSettings.freeDeliveryThreshold}.
              </p>
              <p>
                <strong>Tracking:</strong> You will receive real-time SMS, email, and WhatsApp tracking updates as soon as your package is dispatched with our courier partners (Bluedart, Delhivery, Xpressbees).
              </p>
            </div>
          ),
        };

      case 'returns':
        return {
          title: 'Returns & Exchange Policy',
          icon: <RotateCcw size={22} className="text-[#C5A059]" />,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                Due to strict hygiene standards for cosmetics and skincare formulations, products once unsealed or used cannot be returned.
              </p>
              <p>
                <strong>7-Day Replacement Guarantee:</strong>
                <br />If your product arrives damaged in transit, defective, or incorrect, we will promptly send a fresh replacement or issue a 100% refund without questions asked within 7 days of delivery.
              </p>
              <p>
                To initiate a claim, please message our WhatsApp concierge at <strong>+{storeSettings.whatsappNumber}</strong> or email <strong>{storeSettings.supportEmail}</strong> with an unboxing video or photo.
              </p>
            </div>
          ),
        };

      case 'faq':
        return {
          title: 'Frequently Asked Questions (FAQ)',
          icon: <HelpCircle size={22} className="text-[#C5A059]" />,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-stone-900 mb-1">Are Zeemba products tested on animals?</h4>
                <p>Never. Zeemba Cosmetics is 100% cruelty-free and PETA compliant. We only test on willing humans in dermatological clinical trials.</p>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 mb-1">How do I choose my foundation shade?</h4>
                <p>Our Silk Radiance Foundation shades are specifically crafted for warm, neutral, and golden Indian undertones. You can also chat with our beauty advisor on WhatsApp for personalized matching.</p>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 mb-1">Is Cash on Delivery (COD) available?</h4>
                <p>Yes! We offer Cash on Delivery across 19,000+ PIN codes across India.</p>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 mb-1">Can I place orders via WhatsApp?</h4>
                <p>Absolutely. You can click any "Order via WhatsApp" button on product or bag pages to directly place and confirm orders through our verified business WhatsApp channel.</p>
              </div>
            </div>
          ),
        };

      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <FileText size={22} className="text-[#C5A059]" />,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                At Zeemba Cosmetics, we respect your privacy. We collect minimal personal data—name, delivery address, phone number, and email—exclusively to fulfill orders and provide tracking notifications.
              </p>
              <p>
                We do NOT sell, rent, or trade your personal information with any third-party advertisers. All transaction data is encrypted and processed via PCI-DSS compliant secure gateways.
              </p>
            </div>
          ),
        };

      case 'terms':
        return {
          title: 'Terms & Conditions',
          icon: <FileText size={22} className="text-[#C5A059]" />,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                By using Zeemba Cosmetics, you agree to our terms. Prices, offers, and product stock are subject to availability.
              </p>
              <p>
                Discounts from promotional coupons are calculated according to the specific criteria defined per offer and cannot be combined unless explicitly stated.
              </p>
            </div>
          ),
        };

      case 'contact':
      default:
        return {
          title: 'Contact Customer Concierge',
          icon: <Mail size={22} className="text-[#C5A059]" />,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                Our customer care team is available Monday to Saturday, 9:30 AM to 6:30 PM IST.
              </p>
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200 space-y-2 font-medium">
                <p><strong>Official Address:</strong> {storeSettings.address}</p>
                <p><strong>Email:</strong> {storeSettings.supportEmail}</p>
                <p><strong>Helpline:</strong> {storeSettings.supportPhone}</p>
                <p><strong>WhatsApp Support:</strong> +{storeSettings.whatsappNumber}</p>
              </div>
            </div>
          ),
        };
    }
  };

  const { title, icon, content } = getTitleAndContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-stone-200">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            {icon}
            <h2 className="text-base font-serif font-semibold text-stone-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">{content}</div>

        <div className="p-4 border-t border-stone-100 bg-[#FAF8F5] text-right">
          <button
            onClick={onClose}
            className="bg-stone-900 text-white text-xs font-semibold px-6 py-2 rounded-full hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
