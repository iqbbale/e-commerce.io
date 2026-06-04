import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Zap, Star, TrendingUp } from 'lucide-react';
import { IProduct, ICategory } from '../../../types';
import { productService, categoryService } from '../../../service';
import ProductCard from '../../ui/ProductCard';
import { ProductCardSkeleton } from '../../ui/index';
import styles from './HomePage.module.css';

const FEATURES = [
  { icon: Truck,        title: 'Gratis Ongkir',    desc: 'Pembelian di atas Rp 200.000' },
  { icon: ShieldCheck,  title: 'Transaksi Aman',   desc: 'Pembayaran terenkripsi 100%' },
  { icon: RefreshCw,    title: 'Mudah Return',     desc: '7 hari pengembalian barang' },
  { icon: Headphones,   title: 'Support 24/7',     desc: 'Tim siap membantu Anda' },
];

const TRUST = [
  { icon: Star,        label: '4.9/5 Rating' },
  { icon: TrendingUp,  label: '50K+ Pelanggan' },
  { icon: ShieldCheck, label: 'Transaksi Aman' },
];

const TAGS = ['Fashion', 'Elektronik', 'Rumah', 'Olahraga', 'Kecantikan'];

const CAT_ICONS: Record<string, string> = {
  'Elektronik':'💻', 'Fashion':'👗', 'Rumah & Dapur':'🏠',
  'Kecantikan':'💄', 'Olahraga':'⚽', 'Buku':'📚',
  'Makanan & Minuman':'🍜', 'Otomotif':'🚗',
};

const HomePage = () => {
  const [featured, setFeatured] = useState<IProduct[]>([]);
  const [popular, setPopular] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, p, c] = await Promise.all([
          productService.getFeatured(),
          productService.getAll({ sort: 'popular', limit: 8 }),
          categoryService.getAll(),
        ]);
        setFeatured(f.slice(0, 4));
        setPopular((p.data || []).slice(0, 8));
        setCategories(c.slice(0, 8));
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div>

      {/* ========== HERO ========== */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className="container-custom" style={{ position:'relative', zIndex:1 }}>
          <div className={styles.heroInner}>

            {/* Left */}
            <div className={styles.heroContent}>
              <span className={styles.heroBadge}>
                <Zap size={12} /> Belanja Mudah &amp; Terpercaya
              </span>

              <h1 className={styles.heroTitle}>
                Temukan Produk<br />
                <span className="gradient-text">Premium</span> Terbaik
              </h1>

              <p className={styles.heroDesc}>
                Ribuan produk pilihan dengan kualitas terjamin. Pengiriman cepat
                ke seluruh Indonesia, harga terbaik, dan layanan 24/7.
              </p>

              <div className={styles.heroButtons}>
                <Link to="/products" className="btn btn-primary" style={{ padding:'13px 28px', fontSize:'0.95rem' }}>
                  Belanja Sekarang <ArrowRight size={17} />
                </Link>
                <Link to="/products?featured=true" className="btn btn-secondary" style={{ padding:'13px 28px', fontSize:'0.95rem' }}>
                  Produk Unggulan
                </Link>
              </div>

              <div className={styles.heroTrust}>
                {TRUST.map(({ icon: Icon, label }) => (
                  <div key={label} className={styles.heroTrustItem}>
                    <Icon size={13} style={{ color:'var(--color-primary)' }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Visual */}
            <div className={styles.heroVisual}>
              <div className={styles.heroCard}>
                <div className={styles.heroCardInner}>
                  <span className={styles.heroEmoji}>🛍️</span>
                  <p className={styles.heroCardTitle}>NovaMart</p>
                  <p className={styles.heroCardDesc}>Platform belanja premium online</p>
                  <div className={styles.heroTags}>
                    {TAGS.map(t => <span key={t} className={styles.heroTag}>{t}</span>)}
                  </div>
                </div>
              </div>

              <div className={styles.floatCard}>
                <p className={styles.floatLabel}>Pesanan Hari Ini</p>
                <p className={styles.floatValue}>1.234 📦</p>
              </div>
              <div className={styles.floatCard}>
                <p className={styles.floatLabel}>Rating Kepuasan</p>
                <p className={styles.floatValue}>4.9 ⭐</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className={styles.features}>
        <div className="container-custom">
          <div className={styles.featuresGrid}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={styles.featureCard}>
                <div className={styles.featureIconBox}><Icon size={21} /></div>
                <div>
                  <p className={styles.featureTitle}>{title}</p>
                  <p className={styles.featureDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      {categories.length > 0 && (
        <section className={styles.section}>
          <div className="container-custom">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  Kategori <span className="gradient-text">Pilihan</span>
                </h2>
                <p className={styles.sectionSubtitle}>Temukan produk berdasarkan kategori favorit</p>
              </div>
              <Link to="/products" className="btn btn-ghost" style={{ fontSize:14, gap:6 }}>
                Lihat semua <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.categoryGrid}>
              {categories.map(cat => (
                <Link key={cat._id} to={`/products?category=${cat._id}`} className={styles.categoryCard}>
                  <div className={styles.categoryIconBox}>
                    {cat.image
                      ? <img src={cat.image} alt={cat.name} style={{ width:32, height:32, objectFit:'cover' }} />
                      : <span>{CAT_ICONS[cat.name] || '🏷️'}</span>
                    }
                  </div>
                  <p className={styles.categoryName}>{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== FEATURED PRODUCTS ========== */}
      <section className={styles.sectionAlt}>
        <div className="container-custom">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                Produk <span className="gradient-text">Unggulan</span>
              </h2>
              <p className={styles.sectionSubtitle}>Produk terpilih dengan kualitas premium</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-ghost" style={{ fontSize:14, gap:6 }}>
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.length > 0
                ? featured.map(p => <ProductCard key={p._id} product={p} />)
                : (
                  <div className={styles.emptyProducts}>
                    <div className={styles.emptyProductsIcon}>📦</div>
                    <p className={styles.emptyProductsTitle}>Belum ada produk unggulan</p>
                    <p className={styles.emptyProductsDesc}>
                      Jalankan <code>pnpm seed</code> di backend untuk menambahkan produk
                    </p>
                  </div>
                )
            }
          </div>
        </div>
      </section>

      {/* ========== BANNER CTA ========== */}
      <section className={styles.banner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerPattern} />
        <div className="container-custom">
          <div className={styles.bannerContent}>
            <h2 className={styles.bannerTitle}>
              Dapatkan Penawaran <span style={{ color:'#fed7aa' }}>Eksklusif</span>
            </h2>
            <p className={styles.bannerDesc}>
              Daftar sekarang dan nikmati diskon 20% untuk pembelian pertamamu
            </p>
            <Link to="/register" className={styles.bannerBtn}>
              Daftar Gratis Sekarang <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== POPULAR PRODUCTS ========== */}
      <section className={styles.section}>
        <div className="container-custom">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                Produk <span className="gradient-text">Terlaris</span>
              </h2>
              <p className={styles.sectionSubtitle}>Paling banyak dibeli oleh pelanggan kami</p>
            </div>
            <Link to="/products?sort=popular" className="btn btn-ghost" style={{ fontSize:14, gap:6 }}>
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>

          <div className="product-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : popular.length > 0
                ? popular.map(p => <ProductCard key={p._id} product={p} />)
                : (
                  <div className={styles.emptyProducts}>
                    <div className={styles.emptyProductsIcon}>🛒</div>
                    <p className={styles.emptyProductsTitle}>Belum ada produk</p>
                    <p className={styles.emptyProductsDesc}>
                      Jalankan <code>pnpm seed</code> di backend untuk menambahkan produk
                    </p>
                  </div>
                )
            }
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
