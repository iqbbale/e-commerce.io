import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore, useAuthStore } from '../../utils/store.utils';
import { cartService } from '../../service';
import { formatCurrency } from '../../utils/storage.utils';
import toast from 'react-hot-toast';
import styles from './CartDrawer.module.css';

const CartDrawer = () => {
  const { cart, isOpen, closeCart, setCart, getTotal, itemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      const updated = await cartService.update(productId, quantity);
      setCart(updated);
    } catch {
      toast.error('Gagal memperbarui keranjang');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const updated = await cartService.remove(productId);
      setCart(updated);
      toast.success('Produk dihapus dari keranjang');
    } catch {
      toast.error('Gagal menghapus produk');
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="overlay" onClick={closeCart} />

      {/* Drawer */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
              Keranjang
            </h3>
            {itemCount > 0 && (
              <span className={styles.itemCountBadge}>{itemCount} item</span>
            )}
          </div>
          <button onClick={closeCart} className="btn btn-ghost p-2 rounded-xl">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.drawerContent}>
          {!isAuthenticated ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={48} style={{ color: 'var(--color-primary)', opacity: 0.4 }} />
              <p className="font-semibold text-base">Masuk untuk melihat keranjang</p>
              <Link
                to="/login"
                onClick={closeCart}
                className="btn btn-primary mt-2"
              >
                Masuk Sekarang
              </Link>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingCart size={48} style={{ color: 'var(--color-primary)', opacity: 0.4 }} />
              <p className="font-semibold text-base">Keranjang kosong</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Tambahkan produk ke keranjang
              </p>
              <Link
                to="/products"
                onClick={closeCart}
                className="btn btn-primary mt-2"
              >
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.items.map((item) => {
                const product = item.product as { _id: string; name: string; images: { url: string }[]; slug: string; stock: number };
                return (
                  <div key={product._id} className={styles.cartItem}>
                    {/* Image */}
                    <Link to={`/products/${product.slug}`} onClick={closeCart}>
                      <div className={styles.itemImage}>
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} style={{ color: 'var(--color-text-muted)' }} />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product.slug}`}
                        onClick={closeCart}
                        className="text-sm font-semibold line-clamp-1 hover:text-orange-500 transition-colors"
                      >
                        {product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {item.variant}
                        </p>
                      )}
                      <p className="text-sm font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                        {formatCurrency(item.price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className={styles.quantityControl}>
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={styles.quantityBtn}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold w-7 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className={styles.quantityBtn}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(product._id)}
                          className="p-1.5 rounded-lg transition-colors hover:text-rose-500"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Summary */}
        {cart && cart.items.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total</span>
              <span className="text-xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Syne, sans-serif' }}>
                {formatCurrency(getTotal())}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/cart"
                onClick={closeCart}
                className="btn btn-secondary text-sm py-2.5"
              >
                Lihat Keranjang
              </Link>
              <button
                onClick={handleCheckout}
                className="btn btn-primary text-sm py-2.5"
              >
                Checkout <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
