import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, UserCheck, UserX, Users } from 'lucide-react';
import { IUser } from '../../../types';
import { userService } from '../../../service';
import { formatDate, getInitials } from '../../../utils/storage.utils';
import { Spinner, Pagination, Badge, EmptyState, ConfirmDialog } from '../../ui/index';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [toggleUser, setToggleUser] = useState<IUser | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userService.getAll({
        page,
        limit: 15,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });
      setUsers(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch { toast.error('Gagal memuat pengguna'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async () => {
    if (!toggleId) return;
    setToggling(true);
    try {
      await userService.toggleStatus(toggleId);
      toast.success(`Pengguna berhasil ${toggleUser?.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
      setToggleId(null);
      fetchUsers();
    } catch { toast.error('Gagal mengubah status pengguna'); }
    finally { setToggling(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            Manajemen Pengguna
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {total.toLocaleString()} pengguna terdaftar
          </p>
        </div>
        <button onClick={fetchUsers} className="btn btn-ghost p-2.5" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama atau email..."
            className="input pl-9 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input text-sm"
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="">Semua Role</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pengguna</th>
              <th>Role</th>
              <th>Status</th>
              <th>Telepon</th>
              <th>Bergabung</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><Spinner size={28} /></td></tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <EmptyState icon={<Users size={36} />} title="Belum ada pengguna" />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: user.role === 'admin' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #f97316, #ea580c)' }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                      {user.role === 'admin' ? 'Admin' : 'Customer'}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {user.phone || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {user.createdAt ? formatDate(user.createdAt) : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => { setToggleId(user.id); setToggleUser(user); }}
                          className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <ConfirmDialog
        isOpen={!!toggleId}
        onClose={() => setToggleId(null)}
        onConfirm={handleToggleStatus}
        title={toggleUser?.isActive ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
        message={`Apakah Anda yakin ingin ${toggleUser?.isActive ? 'menonaktifkan' : 'mengaktifkan'} akun "${toggleUser?.name}"?`}
        confirmLabel={toggleUser?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        isDestructive={toggleUser?.isActive}
        isLoading={toggling}
      />
    </div>
  );
};

export default AdminUsers;
