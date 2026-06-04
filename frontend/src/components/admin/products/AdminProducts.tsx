import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Eye, EyeOff, Star, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { IProduct, ICategory } from '../../../types';
import { productService, categoryService } from '../../../service';
import { formatCurrency } from '../../../utils/storage.utils';
import { Spinner, Modal, ConfirmDialog, Pagination, Badge, EmptyState } from '../../ui/index';
import toast from 'react-hot-toast';

interface ProductForm {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  tags: string;
  sku: string;
  isFeatured: boolean;
  isActive: boolean;
  images: string;
  weight?: number;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<IProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductForm>();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productService.getAll({
        page,
        limit: 15,
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
      });
      setProducts(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch { toast.error('Gagal memuat produk'); }
    finally { setLoading(false); }
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoryService.getAll().then(setCategories).catch(() => {}); }, []);

  const openCreate = () => {
    setEditProduct(null);
    reset({
      name: '', description: '', shortDescription: '', price: 0,
      stock: 0, lowStockThreshold: 5, category: '', tags: '',
      sku: '', isFeatured: false, isActive: true, images: '',
    });
    setModalOpen(true);
  };

  const openEdit = (p: IProduct) => {
    setEditProduct(p);
    reset({
      name: p.name,
      description: p.description,
      shortDescription: p.shortDescription || '',
      price: p.price,
      comparePrice: p.comparePrice,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      category: typeof p.category === 'object' ? p.category._id : p.category,
      tags: p.tags.join(', '),
      sku: p.sku,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      images: p.images.map((img) => img.url).join('\n'),
      weight: p.weight,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
        stock: Number(data.stock),
        lowStockThreshold: Number(data.lowStockThreshold),
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        images: data.images
          .split('\n')
          .map((url) => url.trim())
          .filter(Boolean)
          .map((url) => ({ url })),
        weight: data.weight ? Number(data.weight) : undefined,
      };

      if (editProduct) {
        await productService.update(editProduct._id, payload);
        toast.success('Produk berhasil diperbarui!');
      } else {
        await productService.create(payload);
        toast.success('Produk berhasil dibuat!');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Gagal menyimpan produk');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await productService.delete(deleteId);
      toast.success('Produk berhasil dihapus');
      setDeleteId(null);
      fetchProducts();
    } catch { toast.error('Gagal menghapus produk'); }
    finally { setDeleting(false); }
  };

  const handleToggleStatus = async (product: IProduct) => {
    try {
      await productService.update(product._id, { isActive: !product.isActive });
      toast.success(`Produk ${!product.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchProducts();
    } catch { toast.error('Gagal mengubah status'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            Manajemen Produk
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {total.toLocaleString()} produk total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProducts} className="btn btn-ghost p-2.5" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate} className="btn btn-primary gap-2">
            <Plus size={16} /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama produk..."
            className="input pl-9 text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="input text-sm"
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Status</th>
              <th>Terjual</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12"><Spinner size={28} /></td></tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12">
                  <EmptyState
                    icon={<Package size={36} />}
                    title="Belum ada produk"
                    description="Klik tombol Tambah Produk untuk mulai"
                  />
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
                const isOutOfStock = product.stock === 0;
                return (
                  <tr key={product._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: 'var(--color-bg-secondary)' }}
                        >
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} style={{ opacity: 0.3 }} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate max-w-[180px]">{product.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>SKU: {product.sku}</p>
                        </div>
                        {product.isFeatured && (
                          <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {typeof product.category === 'object' ? product.category.name : '—'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                          {formatCurrency(product.price)}
                        </p>
                        {product.comparePrice && (
                          <p className="text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>
                            {formatCurrency(product.comparePrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : ''}`}>
                          {product.stock}
                        </span>
                        {isOutOfStock && <Badge variant="danger" size="sm">Habis</Badge>}
                        {isLowStock && <Badge variant="warning" size="sm">Rendah</Badge>}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => handleToggleStatus(product)}>
                        <Badge variant={product.isActive ? 'success' : 'default'}>
                          {product.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </button>
                    </td>
                    <td>
                      <span className="text-sm">{product.soldCount.toLocaleString()}</span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-slate-100"
                          title={product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {product.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-sky-50 text-sky-500"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product._id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-rose-50 text-rose-500"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* ===== CREATE/EDIT MODAL ===== */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
        maxWidth="700px"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1.5">Nama Produk *</label>
              <input
                {...register('name', { required: 'Nama produk wajib diisi' })}
                className="input"
                placeholder="Nama produk"
              />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Harga (Rp) *</label>
              <input
                {...register('price', { required: true, min: 0 })}
                type="number"
                className="input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Harga Coret (Rp)</label>
              <input
                {...register('comparePrice', { min: 0 })}
                type="number"
                className="input"
                placeholder="0 (opsional)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Stok *</label>
              <input
                {...register('stock', { required: true, min: 0 })}
                type="number"
                className="input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Batas Stok Rendah</label>
              <input
                {...register('lowStockThreshold', { min: 1 })}
                type="number"
                className="input"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Kategori *</label>
              <select {...register('category', { required: 'Kategori wajib dipilih' })} className="input">
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">SKU</label>
              <input {...register('sku')} className="input" placeholder="Auto-generate jika kosong" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Berat (gram)</label>
              <input {...register('weight')} type="number" className="input" placeholder="500" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Tags</label>
              <input
                {...register('tags')}
                className="input"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Pisahkan dengan koma</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1.5">Deskripsi Singkat</label>
              <input
                {...register('shortDescription')}
                className="input"
                placeholder="Deskripsi singkat (maks 300 karakter)"
                maxLength={300}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1.5">Deskripsi Lengkap *</label>
              <textarea
                {...register('description', { required: 'Deskripsi wajib diisi' })}
                className="input"
                rows={4}
                placeholder="Deskripsi lengkap produk..."
                style={{ resize: 'vertical' }}
              />
              {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1.5">URL Gambar</label>
              <textarea
                {...register('images')}
                className="input"
                rows={3}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;(1 URL per baris)"
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm font-medium">Produk Unggulan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm font-medium">Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary flex-1"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? <Spinner size={16} /> : editProduct ? 'Simpan Perubahan' : 'Buat Produk'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message="Produk akan dinonaktifkan dan tidak tampil di toko. Tindakan ini dapat dibatalkan dengan mengaktifkan kembali produk."
        confirmLabel="Hapus"
        isDestructive
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminProducts;
