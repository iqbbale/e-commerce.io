import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Star, BadgeCheck } from 'lucide-react';
import { IProduct } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/storage.utils';
import { cartService, userService } from '../../service';
import { useAuthStore, useCartStore } from '../../utils/store.utils';
import toast from 'react-hot-toast';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: IProduct;
  onWishlistUpdate?: () => void;
}

const ProductCard = ({ product, onWishlistUpdate }: ProductCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { setCart, openCart } = useCartStore();

  const discount = calculateDiscount(product.price, product.comparePrice);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Silakan masuk terlebih dahulu'); return; }
    if (isOutOfStock) return;
    setIsLoading(true);
    try {
      const cart = await cartService.add(product._id, 1);
      setCart(cart);
      toast.success('Ditambahkan ke keranjang!');
      openCart();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Gagal menambahkan ke keranjang');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Silakan masuk terlebih dahulu'); return; }
    try {
      await userService.toggleWishlist(product._id);
      toast.success('Wishlist diperbarui');
      onWishlistUpdate?.();
    } catch {
      toast.error('Gagal memperbarui wishlist');
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        {!imgError && product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className={styles.image}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <ShoppingCart size={32} style={{ opacity: 0.2 }} />
          </div>
        )}

        {/* Badges */}
        <div className={styles.badgeStack}>
          {discount > 0 && (
            <span className={styles.discountBadge}>-{discount}%</span>
          )}
          {product.isFeatured && (
            <span className={styles.featuredBadge}>
              <BadgeCheck size={10} /> Unggulan
            </span>
          )}
          {isOutOfStock && (
            <span className={styles.outOfStockBadge}>Habis</span>
          )}
          {isLowStock && (
            <span className={styles.lowStockBadge}>Sisa {product.stock}</span>
          )}
        </div>

        {/* Quick actions */}
        <div className={styles.quickActions}>
          <button onClick={handleWishlist} className={styles.quickBtn} title="Tambah ke Wishlist">
            <Heart size={15} />
          </button>
          <Link
            to={`/products/${product.slug}`}
            className={styles.quickBtn}
            title="Lihat Detail"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={15} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Category */}
        {product.category && (
          <span className={styles.categoryLabel}>
            {typeof product.category === 'object' ? product.category.name : product.category}
          </span>
        )}

        {/* Name */}
        <h3 className={styles.name}>{product.name}</h3>

        {/* Rating */}
        {product.ratings.count > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
              {[1,2,3,4,5].map((s) => (
                <Star
                  key={s}
                  size={11}
                  fill={s <= Math.round(product.ratings.average) ? '#f59e0b' : 'none'}
                  stroke={s <= Math.round(product.ratings.average) ? '#f59e0b' : '#d1d5db'}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              ({product.ratings.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatCurrency(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className={styles.comparePrice}>{formatCurrency(product.comparePrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className={`${styles.addToCartBtn} ${isOutOfStock ? styles.disabled : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              Menambahkan...
            </span>
          ) : isOutOfStock ? (
            'Stok Habis'
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart size={14} /> Tambah ke Keranjang
            </span>
          )}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
