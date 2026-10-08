# ZEEMBA COSMETICS — Security Specification & Rule Design

## 1. Data Invariants
1. Products and Categories are publicly readable if active (`isActive == true`), but writable ONLY by verified admins (`isAdmin()`).
2. Orders can be read ONLY by the customer who placed the order (`request.auth.uid == resource.data.customerId`) or by an admin.
3. Order creation requires valid customer metadata and positive amounts. Orders cannot be deleted or modified by unauthorized users.
4. Carts and Wishlists are private to each user (`request.auth.uid == userId`).
5. Reviews can be read publicly, but only authenticated users can post reviews with valid ratings (1-5) and author ID matching `request.auth.uid`.
6. Homepage CMS blocks, Offers, Settings, and Admin Activity Logs can only be written by authenticated administrators.
7. Admin roles in `/admins` can only be read and managed by Super Admins and the bootstrapped admin `samiranhajong617@gmail.com`.
8. Analytics events can be created by visitors (rate-guarded) and read by admins.

## 2. The Dirty Dozen Attack Payloads & Test Scenarios
1. **Unauthenticated Product Mutation**: Unauthenticated POST/PUT to `/products/{id}` with `{ name: "Hacked Item", sellingPrice: 0 }` -> REJECTED.
2. **Customer Price Tampering on Product**: Authenticated normal user attempts to change price of `/products/{id}` -> REJECTED.
3. **Cross-Customer Order Snooping**: User A attempts to read `/orders/{orderB_id}` where `customerId == "userB"` -> REJECTED.
4. **Order Status Tampering**: Customer attempts to update order status to `"DELIVERED"` -> REJECTED.
5. **Cart Hijacking**: User A attempts to write or read `/carts/{userB_id}` -> REJECTED.
6. **Wishlist Poisoning**: User A attempts to write `/wishlists/{userB_id}` -> REJECTED.
7. **Privilege Escalation**: Normal customer writes document to `/admins/{their_uid}` with `{ role: "SUPER_ADMIN" }` -> REJECTED.
8. **Shadow Field Injection**: Admin or user sends ghost payload with 500kb arbitrary fields -> REJECTED.
9. **Negative Price / Stock Glitch**: Product created with negative `sellingPrice` or negative `stock` -> REJECTED.
10. **Admin Activity Log Forgery**: Normal customer attempts to forge an audit record in `/adminActivityLogs` -> REJECTED.
11. **Store Settings Tampering**: Non-admin attempts to change payout or WhatsApp contact numbers in `/settings/global` -> REJECTED.
12. **Review Impersonation**: User A submits a review claiming author `customerId == "userB"` -> REJECTED.
