import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import GuestRoute from './GuestRoute';

// Loading
import { PageLoader } from '../components/ui/index';

// Lazy-loaded pages
const HomePage = lazy(() => import('../components/pages/home/HomePage'));
const ProductsPage = lazy(() => import('../components/pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('../components/pages/products/ProductDetailPage'));
const CartPage = lazy(() => import('../components/pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('../components/pages/checkout/CheckoutPage'));
const OrdersPage = lazy(() => import('../components/pages/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('../components/pages/orders/OrderDetailPage'));
const AccountPage = lazy(() => import('../components/pages/account/AccountPage'));
const WishlistPage = lazy(() => import('../components/pages/account/WishlistPage'));
const LoginPage = lazy(() => import('../components/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../components/pages/auth/RegisterPage'));
const NotFoundPage = lazy(() => import('../components/pages/NotFoundPage'));

// Admin pages
const AdminDashboard = lazy(() => import('../components/admin/dashboard/AdminDashboard'));
const AdminProducts = lazy(() => import('../components/admin/products/AdminProducts'));
const AdminOrders = lazy(() => import('../components/admin/orders/AdminOrders'));
const AdminUsers = lazy(() => import('../components/admin/users/AdminUsers'));
const AdminCategories = lazy(() => import('../components/admin/categories/AdminCategories'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const routes: RouteObject[] = [
  // AUTH ROUTES
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <GuestRoute>{withSuspense(LoginPage)}</GuestRoute>,
      },
      {
        path: '/register',
        element: <GuestRoute>{withSuspense(RegisterPage)}</GuestRoute>,
      },
    ],
  },

  // ADMIN ROUTES (protected + admin only)
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'dashboard', element: withSuspense(AdminDashboard) },
      { path: 'products', element: withSuspense(AdminProducts) },
      { path: 'orders', element: withSuspense(AdminOrders) },
      { path: 'users', element: withSuspense(AdminUsers) },
      { path: 'categories', element: withSuspense(AdminCategories) },
    ],
  },

  // CUSTOMER ROUTES
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: withSuspense(HomePage) },
      { path: '/products', element: withSuspense(ProductsPage) },
      { path: '/products/:slug', element: withSuspense(ProductDetailPage) },

      // Protected customer routes
      {
        path: '/cart',
        element: <ProtectedRoute>{withSuspense(CartPage)}</ProtectedRoute>,
      },
      {
        path: '/checkout',
        element: <ProtectedRoute>{withSuspense(CheckoutPage)}</ProtectedRoute>,
      },
      {
        path: '/orders',
        element: <ProtectedRoute>{withSuspense(OrdersPage)}</ProtectedRoute>,
      },
      {
        path: '/orders/:id',
        element: <ProtectedRoute>{withSuspense(OrderDetailPage)}</ProtectedRoute>,
      },
      {
        path: '/account',
        element: <ProtectedRoute>{withSuspense(AccountPage)}</ProtectedRoute>,
      },
      {
        path: '/wishlist',
        element: <ProtectedRoute>{withSuspense(WishlistPage)}</ProtectedRoute>,
      },

      // 404
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },
];

export const router = createBrowserRouter(routes);
export default router;
