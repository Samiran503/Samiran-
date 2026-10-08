import { Product, Order, UserProfile } from '../types';

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportProductsCSV(products: Product[]) {
  const headers = ['Product ID', 'Name', 'Brand', 'Category', 'SKU', 'MRP (₹)', 'Selling Price (₹)', 'Stock', 'Status', 'Best Seller', 'New Arrival'];
  const rows = products.map((p) => [
    escapeCSV(p.id),
    escapeCSV(p.name),
    escapeCSV(p.brand),
    escapeCSV(p.category),
    escapeCSV(p.sku),
    p.mrp,
    p.sellingPrice,
    p.stock,
    p.isActive ? 'Active' : 'Inactive',
    p.isBestSeller ? 'Yes' : 'No',
    p.isNewArrival ? 'Yes' : 'No',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`zeemba-products-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

export function exportOrdersCSV(orders: Order[]) {
  const headers = [
    'Order ID',
    'Customer Name',
    'Phone',
    'Email',
    'City',
    'State',
    'PIN Code',
    'Subtotal (₹)',
    'Discount (₹)',
    'Coupon',
    'Delivery Fee (₹)',
    'Total (₹)',
    'Payment Method',
    'Payment Status',
    'Order Status',
    'Order Date',
  ];

  const rows = orders.map((o) => [
    escapeCSV(o.id),
    escapeCSV(o.customerName),
    escapeCSV(o.phone),
    escapeCSV(o.email),
    escapeCSV(o.city),
    escapeCSV(o.state),
    escapeCSV(o.pincode),
    o.subtotal,
    o.discount,
    escapeCSV(o.couponCode || 'None'),
    o.deliveryFee,
    o.total,
    escapeCSV(o.paymentMethod),
    escapeCSV(o.paymentStatus),
    escapeCSV(o.orderStatus),
    escapeCSV(new Date(o.createdAt).toLocaleString('en-IN')),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`zeemba-orders-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

export function exportInventoryCSV(products: Product[]) {
  const headers = ['Product ID', 'SKU', 'Product Name', 'Category', 'Unit Cost / Selling Price (₹)', 'In Stock (Units)', 'Total Inventory Value (₹)', 'Stock Status'];
  const rows = products.map((p) => {
    const totalVal = p.sellingPrice * p.stock;
    const status = p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'Adequate';
    return [
      escapeCSV(p.id),
      escapeCSV(p.sku),
      escapeCSV(p.name),
      escapeCSV(p.category),
      p.sellingPrice,
      p.stock,
      totalVal,
      escapeCSV(status),
    ];
  });

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`zeemba-inventory-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

export function exportCustomersCSV(customers: UserProfile[], orders: Order[]) {
  const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Total Orders Placed', 'Total Spend (₹)', 'Member Since'];
  const rows = customers.map((c) => {
    const userOrders = orders.filter((o) => o.customerId === c.userId || o.email === c.email);
    const totalSpend = userOrders.reduce((sum, o) => sum + (o.orderStatus !== 'CANCELLED' ? o.total : 0), 0);
    return [
      escapeCSV(c.userId),
      escapeCSV(c.name || 'Anonymous'),
      escapeCSV(c.email),
      escapeCSV(c.phone || 'N/A'),
      userOrders.length,
      totalSpend,
      escapeCSV(new Date(c.createdAt).toLocaleDateString('en-IN')),
    ];
  });

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`zeemba-customers-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

export function exportSalesReportCSV(orders: Order[]) {
  const headers = ['Metric', 'Value'];
  const completedOrders = orders.filter((o) => o.orderStatus !== 'CANCELLED');
  const totalRev = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalDiscount = completedOrders.reduce((sum, o) => sum + o.discount, 0);
  const aov = completedOrders.length > 0 ? Math.round(totalRev / completedOrders.length) : 0;

  const rows = [
    ['Total Completed Orders', completedOrders.length],
    ['Total Gross Sales (₹)', totalRev],
    ['Total Customer Discounts Given (₹)', totalDiscount],
    ['Average Order Value - AOV (₹)', aov],
    ['Report Generation Date', new Date().toLocaleString('en-IN')],
  ];

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`zeemba-sales-summary-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
