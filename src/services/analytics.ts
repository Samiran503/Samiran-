import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { AnalyticsEvent } from '../types';

export async function trackEvent(
  eventName: AnalyticsEvent['eventName'],
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const payload = {
      eventName,
      customerId: auth.currentUser?.uid || 'anonymous',
      customerEmail: auth.currentUser?.email || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      serverCreatedAt: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.pathname : '',
    };

    // Write to Firestore analytics collection
    await addDoc(collection(db, 'analyticsEvents'), payload);
  } catch (err) {
    // Analytics logging should never crash the user journey
    console.debug('Analytics track error (silently caught):', err);
  }
}

// WhatsApp specific helper with direct event logging
export async function trackWhatsAppClick(
  type: 'general' | 'product' | 'checkout' | 'order_update',
  detail?: Record<string, any>
): Promise<void> {
  const eventName =
    type === 'product'
      ? 'product_whatsapp_click'
      : type === 'checkout'
      ? 'checkout_whatsapp_click'
      : 'whatsapp_click';

  await trackEvent(eventName, {
    clickType: type,
    ...detail,
  });
}
