import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { IProduct, ICategory, IProductFilter } from '../../../types';
import { productService, categoryService } from '../../../service';
import ProductCard from '../../ui/ProductCard';
import { ProductCardSkeleton, Pagination, EmptyState } from '../../ui/index';
import { formatCurrency } from '../../../utils/storage.utils';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'rating', label: 'Rating Tertinggi' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const featured = searchParams.get('featured') === 'true';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filters: IProductFilter = {
        page,
        limit: 12,
        ...(search && { search }),
        ...(category && { category }),
        ...(sort && { sort: sort as IProductFilter['sort'] }),
        ...(featured && { featured: true }),
        ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
        ...(priceRange[1] < 10000000 && { maxPrice: priceRange[1] }),
      };
      const result = await productService.getAll(filters);
      setProducts(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [page, search, category, sort, featured, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoryService.getAll().then(setCategories).catch(() => {}); }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = search || category || sort !== '-createdAt' || featured;

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            {search ? `Hasil "${search}"` : featured ? 'Produk Unggulan' : 'Semua Produk'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {loading ? 'Memuat...' : `${total.toLocaleString()} produk ditemukan`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input pr-8 py-2 text-sm appearance-none cursor-pointer"
              style={{ minWidth: 160 }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`btn ${filterOpen ? 'btn-primary' : 'btn-secondary'} gap-2 text-sm py-2 px-4`}
          >
            <SlidersHorizontal size={15} /> Filter
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filter */}
        {filterOpen && (
          <aside
            className="w-64 flex-shrink-0 hidden lg:block animate-slide-up"
            style={{ alignSelf: 'flex-start', position: 'sticky', top: '80px' }}
          >
            <div className="card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Filter</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-rose-500 flex items-center gap-1">
                    <X size={12} /> Reset
                  </button>
                )}
              </div>

              {/* Search */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-text-muted)' }}>Cari</p>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    defaultValue={search}
                    placeholder="Nama produk..."
                    className="input text-sm pl-8"
                    onKeyDown={(e) => e.key === 'Enter' && updateParam('search', (e.target as HTMLInputElement).value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-text-muted)' }}>Kategori</p>
                <div className="space-y-1">
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!category ? 'font-semibold text-orange-500 bg-orange-50' : ''}`}
                    style={{ color: category ? 'var(--color-text-muted)' : undefined }}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => updateParam('category', cat._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${category === cat._id ? 'font-semibold text-orange-500 bg-orange-50' : ''}`}
                      style={{ color: category === cat._id ? undefined : 'var(--color-text-muted)' }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-text-muted)' }}>Rentang Harga</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="input text-xs py-1.5 px-2"
                    placeholder="Min"
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="input text-xs py-1.5 px-2"
                    placeholder="Max"
                  />
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  {formatCurrency(priceRange[0])} — {formatCurrency(priceRange[1])}
                </p>
              </div>

              {/* Featured */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm font-medium">Produk Unggulan</span>
                </label>
              </div>
            </div>
          </aside>
        )}

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter bar */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Filter aktif:</span>
              {search && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  Cari: {search}
                  <button onClick={() => updateParam('search', '')}><X size={10} /></button>
                </span>
              )}
              {category && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  {categories.find((c) => c._id === category)?.name}
                  <button onClick={() => updateParam('category', '')}><X size={10} /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-rose-500 underline">Reset semua</button>
            </div>
          )}

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<span>🔍</span>}
              title="Produk tidak ditemukan"
              description="Coba ubah filter atau kata kunci pencarian Anda"
              action={<button onClick={clearFilters} className="btn btn-primary">Reset Filter</button>}
            />
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateParam('page', String(p))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
