// WishlistPage.tsx
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IProduct } from '../../../types';
import { authService } from '../../../service/auth.service';
import ProductCard from '../../ui/ProductCard';
import { ProductCardSkeleton, EmptyState } from '../../ui/index';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    setLoading(true);
    authService.getMe()
      .then((user) => setWishlist((user.wishlist as unknown as IProduct[]) || []))
      .catch(() => setWishlist([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
        Wishlist Saya
        {wishlist.length > 0 && (
          <span className="ml-2 text-base font-normal" style={{ color: 'var(--color-text-muted)' }}>
            ({wishlist.length} produk)
          </span>
        )}
      </h1>

      {loading ? (
        <div className="product-grid">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart size={48} />}
          title="Wishlist masih kosong"
          description="Tambahkan produk favorit ke wishlist agar mudah ditemukan"
          action={<Link to="/products" className="btn btn-primary">Jelajahi Produk</Link>}
        />
      ) : (
        <div className="product-grid">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} onWishlistUpdate={fetchWishlist} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
