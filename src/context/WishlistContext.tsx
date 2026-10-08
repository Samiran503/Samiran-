import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useStore } from './StoreContext';
import { trackEvent } from '../services/analytics';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  moveToCart: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { products } = useStore();

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zeemba_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!currentUser) return;
    const fetchRemoteWishlist = async () => {
      try {
        const ref = doc(db, 'wishlists', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const list = snap.data().productIds || [];
          if (list.length > 0) {
            setWishlistIds(list);
          } else if (wishlistIds.length > 0) {
            await setDoc(ref, { userId: currentUser.uid, productIds: wishlistIds, updatedAt: new Date().toISOString() });
          }
        } else if (wishlistIds.length > 0) {
          await setDoc(ref, { userId: currentUser.uid, productIds: wishlistIds, updatedAt: new Date().toISOString() });
        }
      } catch (e) {
        console.debug('Wishlist sync note:', e);
      }
    };
    fetchRemoteWishlist();
  }, [currentUser]);

  // Persist locally & remotely
  useEffect(() => {
    localStorage.setItem('zeemba_wishlist', JSON.stringify(wishlistIds));
    if (currentUser) {
      setDoc(
        doc(db, 'wishlists', currentUser.uid),
        { userId: currentUser.uid, productIds: wishlistIds, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
    }
  }, [wishlistIds, currentUser]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      trackEvent('wishlist_remove', { productId });
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      trackEvent('wishlist_add', { productId });
    }
  };

  const moveToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCart(product, 1);
      toggleWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isInWishlist,
        toggleWishlist,
        moveToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
