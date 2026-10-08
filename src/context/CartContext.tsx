import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CartItem, Product, Offer } from '../types';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { trackEvent } from '../services/analytics';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  appliedCoupon: Offer | null;
  deliveryFee: number;
  total: number;
  amountNeededForFreeShipping: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, variantId?: string, variantName?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { offers, storeSettings, products } = useStore();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zeemba_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!currentUser) return;
    const syncCart = async () => {
      try {
        const cartRef = doc(db, 'carts', currentUser.uid);
        const docSnap = await getDoc(cartRef);
        if (docSnap.exists()) {
          const remoteItems = docSnap.data().items as CartItem[];
          if (remoteItems && remoteItems.length > 0) {
            setCart(remoteItems);
          } else if (cart.length > 0) {
            // Push local cart to Firestore
            await setDoc(cartRef, { userId: currentUser.uid, items: cart, updatedAt: new Date().toISOString() });
          }
        } else if (cart.length > 0) {
          await setDoc(cartRef, { userId: currentUser.uid, items: cart, updatedAt: new Date().toISOString() });
        }
      } catch (e) {
        console.debug('Cart sync note:', e);
      }
    };
    syncCart();
  }, [currentUser]);

  // Persist to local storage and Firestore on changes
  useEffect(() => {
    localStorage.setItem('zeemba_cart', JSON.stringify(cart));
    if (currentUser) {
      setDoc(
        doc(db, 'carts', currentUser.uid),
        { userId: currentUser.uid, items: cart, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
    }
  }, [cart, currentUser]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    variantId?: string,
    variantName?: string
  ) => {
    // Check total existing quantity
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.variantId === variantId
    );

    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (requestedTotal > product.stock) {
      alert(`Only ${product.stock} units of ${product.name} are available in stock.`);
      return;
    }

    const unitPrice = product.sellingPrice;

    if (existingIndex > -1) {
      setCart((prev) => {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      });
    } else {
      const newItem: CartItem = {
        productId: product.id,
        product,
        variantId,
        variantName,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      };
      setCart((prev) => [...prev, newItem]);
    }

    trackEvent('add_to_cart', {
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity,
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    const liveProd = products.find((p) => p.id === productId);
    const maxStock = liveProd ? liveProd.stock : 99;

    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    if (quantity > maxStock) {
      alert(`Cannot add more. Maximum available stock is ${maxStock}.`);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
    trackEvent('remove_from_cart', { productId });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Apply Coupon Validation
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const offer = offers.find((o) => o.couponCode.toUpperCase() === trimmed && o.isActive);

    if (!offer) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    if (subtotal < offer.minOrderValue) {
      return {
        success: false,
        message: `This coupon requires a minimum cart value of ${storeSettings.currency}${offer.minOrderValue}.`,
      };
    }

    setAppliedCoupon(offer);
    trackEvent('coupon_used', { code: trimmed, discountType: offer.discountType });
    return { success: true, message: `Coupon ${trimmed} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Re-validate coupon if cart total changes
  let discount = 0;
  if (appliedCoupon) {
    if (subtotal < appliedCoupon.minOrderValue) {
      // Disqualifies
      setAppliedCoupon(null);
    } else {
      if (appliedCoupon.discountType === 'PERCENTAGE') {
        const rawDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
        discount = appliedCoupon.maxDiscount ? Math.min(rawDiscount, appliedCoupon.maxDiscount) : rawDiscount;
      } else {
        discount = appliedCoupon.discountValue;
      }
    }
  }

  // Delivery Fee calculation
  const isFreeDelivery = subtotal >= (storeSettings.freeDeliveryThreshold || 499) || subtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : (storeSettings.deliveryFee || 49);
  const amountNeededForFreeShipping = Math.max(0, (storeSettings.freeDeliveryThreshold || 499) - subtotal);
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        discount,
        appliedCoupon,
        deliveryFee,
        total,
        amountNeededForFreeShipping,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
