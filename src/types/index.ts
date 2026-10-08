export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EDITOR' | 'CUSTOMER';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "01 Velvet Rose", "50ml", "Fair Ivory"
  shadeColor?: string; // hex code for visual swatch e.g. "#A83E4C"
  sku?: string;
  stock: number;
  priceModifier?: number; // +/- difference from base price
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription?: string;
  images: string[];
  thumbnail: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  stock: number;
  sku: string;
  barcode?: string;
  variants?: ProductVariant[];
  tags: string[];
  ingredients?: string;
  howToUse?: string;
  weightVolume?: string; // e.g. "30 ml", "4.2 g"
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'COD_PENDING' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  thumbnail: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  total: number;
  paymentMethod: 'COD' | 'ONLINE' | 'WHATSAPP';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  isWhatsAppOrder?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  title: string;
  bannerUrl?: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  couponCode: string;
  minOrderValue: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  usageLimit?: number;
  perUserLimit?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroBannerUrl: string;
  announcementText: string;
  promoBanners?: {
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    buttonText: string;
    link: string;
    imageUrl: string;
  }[];
  featuredCategoryIds?: string[];
  featuredProductIds?: string[];
  updatedBy?: string;
  updatedAt?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string; // e.g. "919876543210"
  freeDeliveryThreshold: number; // e.g. 499
  deliveryFee: number; // e.g. 49
  currency: string; // e.g. "₹"
  instagramUrl: string;
  address: string;
  updatedAt?: string;
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName:
    | 'page_view'
    | 'product_view'
    | 'search'
    | 'category_view'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'wishlist_add'
    | 'wishlist_remove'
    | 'begin_checkout'
    | 'purchase'
    | 'whatsapp_click'
    | 'product_whatsapp_click'
    | 'checkout_whatsapp_click'
    | 'sign_up'
    | 'login'
    | 'coupon_used';
  customerId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  addresses?: {
    id: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }[];
  createdAt: string;
  updatedAt?: string;
}
