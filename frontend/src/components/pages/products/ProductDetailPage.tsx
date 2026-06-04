import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronLeft, Star, Shield, Truck, RotateCcw, Plus, Minus } from 'lucide-react';
import { IProduct, IReview } from '../../../types';
import { productService, reviewService, cartService, userService } from '../../../service';
import { useAuthStore, useCartStore } from '../../../utils/store.utils';
import { formatCurrency, calculateDiscount, formatDate } from '../../../utils/storage.utils';
import { StarRating, Spinner, TextSkeleton } from '../../ui/index';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { setCart, openCart } = useCartStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      productService.getBySlug(slug),
    ]).then(([prod]) => {
      setProduct(prod);
      reviewService.getByProduct(prod._id).then(setReviews).catch(() => {});
    }).catch(() => toast.error('Produk tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Silakan masuk terlebih dahulu'); return; }
    if (!product) return;
    setAddingToCart(true);
    try {
      const cart = await cartService.add(product._id, quantity);
      setCart(cart);
      toast.success('Ditambahkan ke keranjang!');
      openCart();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Gagal menambahkan ke keranjang');
    } finally { setAddingToCart(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Silakan masuk terlebih dahulu'); return; }
    if (!product) return;
    try {
      await userService.toggleWishlist(product._id);
      toast.success('Wishlist diperbarui');
    } catch { toast.error('Gagal'); }
  };

  if (loading) return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton w-16 h-16 rounded-lg" />)}
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <TextSkeleton lines={6} />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container-custom py-16 text-center">
      <p className="text-lg font-semibold mb-4">Produk tidak ditemukan</p>
      <Link to="/products" className="btn btn-primary">Lihat Produk Lain</Link>
    </div>
  );

  const discount = calculateDiscount(product.price, product.comparePrice);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        <Link to="/" className="hover:text-orange-500 transition-colors">Beranda</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-orange-500 transition-colors">Produk</Link>
        <span>/</span>
        <span className="truncate max-w-48">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div className="space-y-3">
          <div
            className="aspect-square rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            {product.images?.[activeImage]?.url ? (
              <img
                src={product.images[activeImage].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart size={64} style={{ opacity: 0.1 }} />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                  style={{
                    border: `2px solid ${i === activeImage ? '#f97316' : 'var(--color-border)'}`,
                    background: 'var(--color-bg-secondary)',
                  }}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {typeof product.category === 'object' && (
            <Link
              to={`/products?category=${product.category._id}`}
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-primary)' }}
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            {product.name}
          </h1>

          {product.ratings.count > 0 && (
            <StarRating rating={product.ratings.average} count={product.ratings.count} showCount size={16} />
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'Syne, sans-serif' }}>
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-lg line-through" style={{ color: 'var(--color-text-muted)' }}>
                  {formatCurrency(product.comparePrice)}
                </span>
                <span className="text-sm font-bold text-white px-2 py-0.5 rounded-full" style={{ background: '#f43f5e' }}>
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div>
            {isOutOfStock ? (
              <span className="text-rose-500 font-semibold text-sm">Stok Habis</span>
            ) : (
              <span className="text-emerald-600 font-semibold text-sm">✓ Tersedia {product.stock} unit</span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {product.shortDescription}
            </p>
          )}

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold">Jumlah:</p>
              <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-orange-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-orange-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="btn btn-primary flex-1 py-3.5 text-base gap-2"
            >
              {addingToCart ? <Spinner size={18} /> : <><ShoppingCart size={18} /> Tambah ke Keranjang</>}
            </button>
            <button
              onClick={handleWishlist}
              className="btn btn-secondary p-3.5"
              title="Tambah ke Wishlist"
            >
              <Heart size={20} />
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Shield, text: 'Pembayaran Aman' },
              { icon: Truck, text: 'Pengiriman Cepat' },
              { icon: RotateCcw, text: 'Return 7 Hari' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center" style={{ background: 'var(--color-bg-secondary)' }}>
                <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                <span className="text-xs font-medium leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Deskripsi Produk</h2>
            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-muted)' }}>
              {product.description}
            </div>
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Ulasan ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                Belum ada ulasan untuk produk ini
              </p>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review._id} className="pb-5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                      >
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{review.user.name}</p>
                          {review.isVerifiedPurchase && (
                            <span className="text-xs font-medium text-emerald-600">✓ Pembelian Terverifikasi</span>
                          )}
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex mt-1 mb-2">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={12} fill={s <= review.rating ? '#f59e0b' : 'none'} stroke={s <= review.rating ? '#f59e0b' : '#d1d5db'} />
                          ))}
                        </div>
                        <p className="font-semibold text-sm mb-1">{review.title}</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar product info */}
        <div>
          <div className="card p-5 space-y-3 text-sm">
            <h3 className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Informasi Produk</h3>
            {[
              { label: 'SKU', value: product.sku },
              { label: 'Terjual', value: `${product.soldCount.toLocaleString()} unit` },
              { label: 'Dilihat', value: `${product.viewCount.toLocaleString()} kali` },
              ...(product.weight ? [{ label: 'Berat', value: `${product.weight}g` }] : []),
              ...(product.tags.length > 0 ? [{ label: 'Tag', value: product.tags.join(', ') }] : []),
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
                <span className="font-medium text-right max-w-32 truncate">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
