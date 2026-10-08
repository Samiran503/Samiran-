import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  addDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import {
  Product,
  Category,
  Offer,
  Order,
  HomepageContent,
  StoreSettings,
  AdminActivityLog,
  Review,
  OrderStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_OFFERS,
  INITIAL_HOMEPAGE_CMS,
  INITIAL_STORE_SETTINGS,
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { trackEvent } from '../services/analytics';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  offers: Offer[];
  orders: Order[];
  homepageContent: HomepageContent;
  storeSettings: StoreSettings;
  adminLogs: AdminActivityLog[];
  loadingProducts: boolean;
  loadingOrders: boolean;
  // Admin Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Admin Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => Promise<string>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Admin Offers CRUD
  addOffer: (offer: Omit<Offer, 'id'>) => Promise<string>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  // Orders & Inventory
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateStock: (productId: string, newStock: number) => Promise<void>;
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  // CMS & Settings
  updateHomepageContent: (content: Partial<HomepageContent>) => Promise<void>;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;
  // Reviews
  fetchProductReviews: (productId: string) => Promise<Review[]>;
  submitReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  // Audit logs
  logAdminActivity: (action: string, targetType: string, details: string, targetId?: string) => Promise<void>;
  // Seed database
  seedDatabaseIfNeeded: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(INITIAL_HOMEPAGE_CMS);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // 1. Listen for Products
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
          setProducts(list);
        } else {
          // If Firestore collection is empty, fallback to initial products
          setProducts(INITIAL_PRODUCTS);
        }
        setLoadingProducts(false);
      },
      (error) => {
        console.warn('Error reading products from Firestore, using initial dataset:', error);
        setProducts(INITIAL_PRODUCTS);
        setLoadingProducts(false);
      }
    );
    return () => unsub();
  }, []);

  // 2. Listen for Categories
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setCategories(list);
        } else {
          setCategories(INITIAL_CATEGORIES);
        }
      },
      (err) => {
        console.warn('Categories snapshot notice:', err);
        setCategories(INITIAL_CATEGORIES);
      }
    );
    return () => unsub();
  }, []);

  // 3. Listen for Offers
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'offers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
          setOffers(list);
        } else {
          setOffers(INITIAL_OFFERS);
        }
      },
      (err) => {
        console.warn('Offers snapshot notice:', err);
        setOffers(INITIAL_OFFERS);
      }
    );
    return () => unsub();
  }, []);

  // 4. Listen for Homepage CMS
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'homepage', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          setHomepageContent(docSnap.data() as HomepageContent);
        } else {
          setHomepageContent(INITIAL_HOMEPAGE_CMS);
        }
      },
      (err) => {
        console.warn('Homepage CMS snapshot notice:', err);
      }
    );
    return () => unsub();
  }, []);

  // 5. Listen for Settings
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setStoreSettings(docSnap.data() as StoreSettings);
        } else {
          setStoreSettings(INITIAL_STORE_SETTINGS);
        }
      },
      (err) => {
        console.warn('Store settings snapshot notice:', err);
      }
    );
    return () => unsub();
  }, []);

  // 6. Listen for Orders (Based on role: Admins see all, Customers see their own)
  useEffect(() => {
    setLoadingOrders(true);
    let q;
    if (isAdmin) {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else if (currentUser) {
      q = query(
        collection(db, 'orders'),
        where('customerId', '==', currentUser.uid)
      );
    } else {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
        setLoadingOrders(false);
      },
      (err) => {
        console.debug('Orders snapshot notice:', err);
        setLoadingOrders(false);
      }
    );

    return () => unsub();
  }, [currentUser, isAdmin]);

  // 7. Listen for Admin Logs (Only if Admin)
  useEffect(() => {
    if (!isAdmin) {
      setAdminLogs([]);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, 'adminActivityLogs'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AdminActivityLog));
        setAdminLogs(list);
      },
      (err) => console.debug('Admin logs snapshot notice:', err)
    );
    return () => unsub();
  }, [isAdmin]);

  // Seed initial data to Firestore if user is admin
  const seedDatabaseIfNeeded = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        for (const p of INITIAL_PRODUCTS) {
          await setDoc(doc(db, 'products', p.id), p);
        }
        for (const c of INITIAL_CATEGORIES) {
          await setDoc(doc(db, 'categories', c.id), c);
        }
        for (const o of INITIAL_OFFERS) {
          await setDoc(doc(db, 'offers', o.id), o);
        }
        await setDoc(doc(db, 'homepage', 'main'), INITIAL_HOMEPAGE_CMS);
        await setDoc(doc(db, 'settings', 'global'), INITIAL_STORE_SETTINGS);
        console.log('Successfully seeded database with Zeemba Cosmetics catalog!');
      }
    } catch (e) {
      console.warn('Database seed check info:', e);
    }
  };

  const logAdminActivity = async (action: string, targetType: string, details: string, targetId?: string) => {
    if (!currentUser || !isAdmin) return;
    try {
      const logItem: AdminActivityLog = {
        id: `log-${Date.now()}`,
        adminId: currentUser.uid,
        adminEmail: currentUser.email || 'Admin',
        action,
        targetType,
        targetId: targetId || '',
        details,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'adminActivityLogs'), logItem);
    } catch (err) {
      console.error('Audit log write error:', err);
    }
  };

  // Product CRUD
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, 'products', id), newProduct);
      await logAdminActivity('Product created', 'Product', `Created ${newProduct.name} (${newProduct.sku})`, id);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${id}`);
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'products', id), { ...data, updatedAt: now });
      await logAdminActivity('Product updated', 'Product', `Updated product details for ID: ${id}`, id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      await logAdminActivity('Product deleted', 'Product', `Deleted product ID: ${id}`, id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  // Category CRUD
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<string> => {
    const id = `cat-${Date.now()}`;
    const newCategory: Category = {
      ...catData,
      id,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'categories', id), newCategory);
      await logAdminActivity('Category created', 'Category', `Created category ${newCategory.name}`, id);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${id}`);
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await updateDoc(doc(db, 'categories', id), { ...data, updatedAt: new Date().toISOString() });
      await logAdminActivity('Category updated', 'Category', `Updated category ID: ${id}`, id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      await logAdminActivity('Category deleted', 'Category', `Deleted category ID: ${id}`, id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  // Offer CRUD
  const addOffer = async (offerData: Omit<Offer, 'id'>): Promise<string> => {
    const id = `offer-${Date.now()}`;
    const newOffer: Offer = {
      ...offerData,
      id,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'offers', id), newOffer);
      await logAdminActivity('Offer created', 'Offer', `Created offer: ${newOffer.couponCode}`, id);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `offers/${id}`);
    }
  };

  const updateOffer = async (id: string, data: Partial<Offer>) => {
    try {
      await updateDoc(doc(db, 'offers', id), { ...data, updatedAt: new Date().toISOString() });
      await logAdminActivity('Offer updated', 'Offer', `Updated offer ID: ${id}`, id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `offers/${id}`);
    }
  };

  const deleteOffer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'offers', id));
      await logAdminActivity('Offer deleted', 'Offer', `Deleted offer ID: ${id}`, id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `offers/${id}`);
    }
  };

  // Stock & Inventory
  const updateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) throw new Error('Stock cannot be negative.');
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: newStock,
        updatedAt: new Date().toISOString(),
      });
      await logAdminActivity('Stock adjusted', 'Inventory', `Adjusted stock of ${productId} to ${newStock}`, productId);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    }
  };

  // Order Placement (Atomic validation + Deduct stock)
  const placeOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const orderId = `ZMB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // 1. Verify stocks
      for (const item of newOrder.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && prod.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}`);
        }
      }

      // 2. Save Order to Firestore
      await setDoc(doc(db, 'orders', orderId), newOrder);

      // 3. Decrement stock for ordered products
      for (const item of newOrder.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          const nextStock = Math.max(0, prod.stock - item.quantity);
          await updateDoc(doc(db, 'products', item.productId), { stock: nextStock });
        }
      }

      // 4. Analytics event
      await trackEvent('purchase', {
        orderId,
        total: newOrder.total,
        itemsCount: newOrder.items.length,
        paymentMethod: newOrder.paymentMethod,
      });

      return orderId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: status,
        updatedAt: new Date().toISOString(),
      });
      await logAdminActivity('Order status changed', 'Order', `Changed order ${orderId} status to ${status}`, orderId);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // CMS & Settings
  const updateHomepageContent = async (content: Partial<HomepageContent>) => {
    try {
      const now = new Date().toISOString();
      await setDoc(
        doc(db, 'homepage', 'main'),
        {
          ...content,
          updatedBy: currentUser?.email || 'admin',
          updatedAt: now,
        },
        { merge: true }
      );
      await logAdminActivity('Homepage CMS updated', 'CMS', 'Updated homepage hero or sections');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'homepage/main');
    }
  };

  const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
    try {
      await setDoc(
        doc(db, 'settings', 'global'),
        { ...settings, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      await logAdminActivity('Store Settings updated', 'Settings', 'Updated store global configuration');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/global');
    }
  };

  // Reviews
  const fetchProductReviews = async (productId: string): Promise<Review[]> => {
    try {
      const q = query(collection(db, 'reviews'), where('productId', '==', productId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
    } catch (err) {
      console.warn('Reviews fetch note:', err);
      return [];
    }
  };

  const submitReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const id = `rev-${Date.now()}`;
    const newRev: Review = {
      ...reviewData,
      id,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'reviews', id), newRev);
      // Update product rating average
      const allRevs = await fetchProductReviews(reviewData.productId);
      const totalRatings = allRevs.reduce((s, r) => s + r.rating, 0) + reviewData.rating;
      const avg = Number((totalRatings / (allRevs.length + 1)).toFixed(1));
      await updateDoc(doc(db, 'products', reviewData.productId), {
        rating: avg,
        reviewCount: allRevs.length + 1,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${id}`);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        offers,
        orders,
        homepageContent,
        storeSettings,
        adminLogs,
        loadingProducts,
        loadingOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addOffer,
        updateOffer,
        deleteOffer,
        updateOrderStatus,
        updateStock,
        placeOrder,
        updateHomepageContent,
        updateStoreSettings,
        fetchProductReviews,
        submitReview,
        logAdminActivity,
        seedDatabaseIfNeeded,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
