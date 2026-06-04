import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../ui/Navbar';
import Footer from '../ui/Footer';
import CartDrawer from '../ui/CartDrawer';
import { useAuthStore, useCartStore } from '../../utils/store.utils';
import { cartService } from '../../service';

const MainLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const location = useLocation();

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      cartService.get().then((cart) => {
        if (cart) setCart(cart);
      }).catch(() => {});
    }
  }, [isAuthenticated, setCart]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Navbar />
      <main className="flex-1 page-enter">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default MainLayout;
