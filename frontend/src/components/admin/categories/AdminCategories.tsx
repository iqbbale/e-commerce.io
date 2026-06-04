import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Tag, RefreshCw, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ICategory } from '../../../types';
import { categoryService } from '../../../service';
import { Modal, ConfirmDialog, Badge, EmptyState, Spinner } from '../../ui/index';
import toast from 'react-hot-toast';

interface CategoryForm {
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [filtered, setFiltered] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<ICategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      setFiltered(data);
    } catch { toast.error('Gagal memuat kategori'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(categories); return; }
    setFiltered(categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())));
  }, [search, categories]);

  const openCreate = () => {
    setEditCat(null);
    reset({ name: '', description: '', image: '', sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (cat: ICategory) => {
    setEditCat(cat);
    reset({ name: cat.name, description: cat.description, image: cat.image, sortOrder: cat.sortOrder, isActive: cat.isActive });
    setModalOpen(true);
  };

  const onSubmit = async (data: CategoryForm) => {
    setSaving(true);
    try {
      if (editCat) {
        await categoryService.update(editCat._id, data);
        toast.success('Kategori berhasil diperbarui!');
      } else {
        await categoryService.create(data);
        toast.success('Kategori berhasil dibuat!');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Gagal menyimpan kategori');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await categoryService.delete(deleteId);
      toast.success('Kategori berhasil dihapus');
      setDeleteId(null);
      fetchCategories();
    } catch { toast.error('Gagal menghapus kategori'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            Manajemen Kategori
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {categories.length} kategori tersedia
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCategories} className="btn btn-ghost p-2.5" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate} className="btn btn-primary gap-2">
            <Plus size={16} /> Tambah Kategori
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kategori..."
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Tag size={36} />}
          title="Belum ada kategori"
          description="Tambahkan kategori untuk mengorganisasi produk"
          action={<button onClick={openCreate} className="btn btn-primary">Tambah Kategori</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((cat) => (
            <div key={cat._id} className="card p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: 'rgba(249,115,22,0.08)' }}
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Tag size={20} style={{ color: 'var(--color-primary)' }} />
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat._id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-sm mb-1">{cat.name}</h3>
              {cat.description && (
                <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                  {cat.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <Badge variant={cat.isActive ? 'success' : 'default'} size="sm">
                  {cat.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Urutan: {cat.sortOrder}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCat ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        maxWidth="460px"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nama Kategori *</label>
            <input
              {...register('name', { required: 'Nama wajib diisi' })}
              className="input"
              placeholder="Nama kategori"
            />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Deskripsi</label>
            <textarea
              {...register('description')}
              className="input"
              rows={2}
              placeholder="Deskripsi singkat (opsional)"
              style={{ resize: 'none' }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">URL Gambar</label>
            <input
              {...register('image')}
              className="input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Urutan Tampil</label>
            <input
              {...register('sortOrder', { min: 0 })}
              type="number"
              className="input"
              placeholder="0"
            />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-orange-500" />
            <span className="text-sm font-medium">Kategori Aktif</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary flex-1" disabled={saving}>
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? <Spinner size={16} /> : editCat ? 'Simpan Perubahan' : 'Buat Kategori'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Kategori"
        message="Kategori akan dinonaktifkan. Produk yang menggunakan kategori ini tidak akan terpengaruh."
        confirmLabel="Hapus"
        isDestructive
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminCategories;
