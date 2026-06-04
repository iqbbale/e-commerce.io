import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, Search, Heart, Menu, X, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useAuthStore, useCartStore } from '../../utils/store.utils';
import { authService } from '../../service/auth.service';
import { categoryService } from '../../service';
import { ICategory } from '../../types';
import { getInitials } from '../../utils/storage.utils';
import toast from 'react-hot-toast';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, toggleCart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { categoryService.getAll().then(setCategories).catch(()=>{}); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ(''); setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    logout();
    navigate('/');
    toast.success('Berhasil logout');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className="container-custom">
          {/* Main bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64, gap:16 }}>

            {/* Logo */}
            <Link to="/" className={styles.logo}>
              <div className={styles.logoIcon}><ShoppingBag size={19} color="#fff"/></div>
              <span className={styles.logoText}>NovaMart</span>
            </Link>

            {/* Desktop Nav */}
            <nav style={{ display:'flex', alignItems:'center', gap:4, flex:1, justifyContent:'center' }}
              className="hidden-mobile">
              <Link to="/" className={styles.navLink}>Beranda</Link>

              <div className={styles.navDropdown}>
                <button className={styles.navLink}>
                  Kategori <ChevronDown size={13}/>
                </button>
                <div className={styles.dropdownMenu}>
                  <Link to="/products" className={styles.dropdownItem}>Semua Produk</Link>
                  {categories.slice(0,8).map(cat=>(
                    <Link key={cat._id} to={`/products?category=${cat._id}`} className={styles.dropdownItem}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/products?featured=true" className={styles.navLink}>Unggulan</Link>
              <Link to="/products?sort=popular" className={styles.navLink}>Terpopuler</Link>
            </nav>

            {/* Actions */}
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              {/* Search */}
              <button onClick={()=>setSearchOpen(!searchOpen)} className={styles.iconBtn} title="Cari">
                {searchOpen ? <X size={18}/> : <Search size={18}/>}
              </button>

              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className={styles.iconBtn} title="Wishlist" style={{ display:'flex' }}>
                    <Heart size={18}/>
                  </Link>
                  <button onClick={toggleCart} className={styles.iconBtn} title="Keranjang" style={{ position:'relative' }}>
                    <ShoppingCart size={18}/>
                    {itemCount > 0 && <span className={styles.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>}
                  </button>

                  {/* User menu desktop */}
                  <div style={{ position:'relative' }} ref={userMenuRef} className="hidden-mobile">
                    <button onClick={()=>setUserMenuOpen(!userMenuOpen)} className={styles.userBtn}>
                      <div className={styles.userAvatar}>{user ? getInitials(user.name) : 'U'}</div>
                      <span style={{ fontSize:13, fontWeight:600, maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown size={13}/>
                    </button>

                    {userMenuOpen && (
                      <div className={styles.userMenu}>
                        <div className={styles.userMenuHeader}>
                          <p className={styles.userMenuHeaderName}>{user?.name}</p>
                          <p className={styles.userMenuHeaderEmail}>{user?.email}</p>
                        </div>
                        {[
                          { to:'/account', icon:<Settings size={14}/>, label:'Profil Saya' },
                          { to:'/orders', icon:<Package size={14}/>, label:'Pesanan Saya' },
                          { to:'/wishlist', icon:<Heart size={14}/>, label:'Wishlist' },
                          ...(user?.role==='admin' ? [{ to:'/admin/dashboard', icon:<ShoppingBag size={14}/>, label:'Panel Admin' }] : []),
                        ].map(item=>(
                          <Link key={item.to} to={item.to} className={styles.userMenuItem} onClick={()=>setUserMenuOpen(false)}>
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        <div className={styles.userMenuDivider}/>
                        <button onClick={handleLogout} className={styles.userMenuItem} style={{ color:'#f43f5e' }}>
                          <LogOut size={14}/> Keluar
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:8 }} className="hidden-mobile">
                  <Link to="/login" className="btn btn-ghost" style={{ padding:'8px 16px', fontSize:14 }}>Masuk</Link>
                  <Link to="/register" className="btn btn-primary" style={{ padding:'8px 18px', fontSize:14 }}>Daftar</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button onClick={()=>setMobileOpen(!mobileOpen)} className={`${styles.iconBtn} show-mobile`}>
                {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className={styles.searchBar}>
              <form onSubmit={handleSearch} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <Search size={17} style={{ color:'var(--color-text-muted)', flexShrink:0 }}/>
                <input
                  autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                  placeholder="Cari produk, merek, kategori..."
                  className={styles.searchInput}
                />
                {searchQ && (
                  <button type="button" onClick={()=>setSearchQ('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', display:'flex' }}>
                    <X size={15}/>
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && <div className="overlay show-mobile" onClick={()=>setMobileOpen(false)} style={{ zIndex:34 }}/>}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuInner}>
            {isAuthenticated && user && (
              <div className={styles.mobileUserCard}>
                <div className={styles.userAvatar} style={{ width:36, height:36, fontSize:13 }}>{getInitials(user.name)}</div>
                <div>
                  <p style={{ fontWeight:700, fontSize:14 }}>{user.name}</p>
                  <p style={{ fontSize:12, color:'var(--color-text-muted)' }}>{user.role==='admin'?'Admin':'Customer'}</p>
                </div>
              </div>
            )}

            {[
              { to:'/', label:'🏠 Beranda' },
              { to:'/products', label:'📦 Semua Produk' },
              { to:'/products?featured=true', label:'⭐ Produk Unggulan' },
              { to:'/products?sort=popular', label:'🔥 Terpopuler' },
            ].map(item=>(
              <Link key={item.to} to={item.to} className={styles.mobileNavLink}>{item.label}</Link>
            ))}

            {isAuthenticated ? (
              <>
                <div className={styles.mobileDivider}/>
                <Link to="/account" className={styles.mobileNavLink}>⚙️ Profil Saya</Link>
                <Link to="/orders" className={styles.mobileNavLink}>📋 Pesanan Saya</Link>
                <Link to="/wishlist" className={styles.mobileNavLink}>❤️ Wishlist</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className={styles.mobileNavLink}>🛠️ Panel Admin</Link>
                )}
                <div className={styles.mobileDivider}/>
                <button onClick={handleLogout} className={styles.mobileNavLink} style={{ color:'#f43f5e' }}>
                  🚪 Keluar
                </button>
              </>
            ) : (
              <div className={styles.mobileAuthBtns}>
                <Link to="/login" className="btn btn-secondary" style={{ width:'100%', justifyContent:'center', padding:'12px' }}>Masuk</Link>
                <Link to="/register" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px' }}>Daftar Gratis</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media(min-width:1024px){ .show-mobile{display:none!important;} }
        @media(max-width:1023px){ .hidden-mobile{display:none!important;} }
      `}</style>
    </>
  );
};

export default Navbar;
