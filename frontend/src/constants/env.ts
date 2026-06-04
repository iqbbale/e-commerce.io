export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'NovaMart',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
} as const;

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  ACCOUNT: '/account',
  WISHLIST: '/wishlist',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'novamart_access_token',
  REFRESH_TOKEN: 'novamart_refresh_token',
  USER: 'novamart_user',
  CART: 'novamart_cart_cache',
  THEME: 'novamart_theme',
  SEARCH_HISTORY: 'novamart_search_history',
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  ADMIN_LIMIT: 15,
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Menunggu Pembayaran',
  paid: 'Pembayaran Diterima',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
  refunded: 'Dikembalikan',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending_payment: 'text-amber-600 bg-amber-50 border-amber-200',
  paid: 'text-sky-600 bg-sky-50 border-sky-200',
  processing: 'text-violet-600 bg-violet-50 border-violet-200',
  shipped: 'text-blue-600 bg-blue-50 border-blue-200',
  delivered: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  cancelled: 'text-rose-600 bg-rose-50 border-rose-200',
  refunded: 'text-gray-600 bg-gray-50 border-gray-200',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Transfer Bank',
  credit_card: 'Kartu Kredit',
  e_wallet: 'E-Wallet',
  cod: 'Bayar di Tempat (COD)',
};
