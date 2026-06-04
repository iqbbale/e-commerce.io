import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, MapPin, Package, ChevronRight, Save } from 'lucide-react';
import { useAuthStore } from '../../../utils/store.utils';
import { authService } from '../../../service/auth.service';
import { Spinner } from '../../ui/index';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ProfileForm { name: string; phone: string; }
interface PasswordForm { currentPassword: string; newPassword: string; confirmPassword: string; }

const AccountPage = () => {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'password' | 'address'>('profile');
  const [saving, setSaving] = useState(false);

  const profileForm = useForm<ProfileForm>({ defaultValues: { name: user?.name || '', phone: user?.phone || '' } });
  const passwordForm = useForm<PasswordForm>();

  const onSaveProfile = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile(data);
      updateUser(updated);
      toast.success('Profil berhasil diperbarui!');
    } catch { toast.error('Gagal memperbarui profil'); }
    finally { setSaving(false); }
  };

  const onChangePassword = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) { toast.error('Password baru tidak cocok'); return; }
    setSaving(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password berhasil diubah!');
      passwordForm.reset();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Gagal mengubah password');
    } finally { setSaving(false); }
  };

  const TABS = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'password', label: 'Keamanan', icon: Lock },
    { key: 'address', label: 'Alamat', icon: MapPin },
  ] as const;

  return (
    <div className="container-custom py-8 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Akun Saya</h1>
        <Link to="/orders" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          <Package size={15} /> Pesanan Saya <ChevronRight size={14} />
        </Link>
      </div>

      {/* User Card */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg">{user?.name}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ background: 'rgba(249,115,22,0.1)', color: 'var(--color-primary)' }}
          >
            {user?.role === 'admin' ? 'Admin' : 'Customer'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all"
            style={{
              borderColor: tab === key ? '#f97316' : 'transparent',
              color: tab === key ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'profile' && (
        <div className="card p-6 animate-fade-in">
          <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Edit Profil</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Nama Lengkap</label>
              <input {...profileForm.register('name', { required: true })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email</label>
              <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Email tidak dapat diubah</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">No. Telepon</label>
              <input {...profileForm.register('phone')} className="input" placeholder="08xxxxxxxxxx" />
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary gap-2">
              {saving ? <Spinner size={16} /> : <><Save size={15} /> Simpan Perubahan</>}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card p-6 animate-fade-in">
          <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Ubah Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            {[
              { name: 'currentPassword' as const, label: 'Password Saat Ini', placeholder: 'Password lama' },
              { name: 'newPassword' as const, label: 'Password Baru', placeholder: 'Min. 6 karakter' },
              { name: 'confirmPassword' as const, label: 'Konfirmasi Password Baru', placeholder: 'Ulangi password baru' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold mb-1.5">{field.label}</label>
                <input
                  {...passwordForm.register(field.name, { required: true, ...(field.name === 'newPassword' && { minLength: 6 }) })}
                  type="password"
                  className="input"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn btn-primary gap-2">
              {saving ? <Spinner size={16} /> : <><Lock size={15} /> Ubah Password</>}
            </button>
          </form>
        </div>
      )}

      {tab === 'address' && (
        <div className="card p-6 animate-fade-in">
          <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Alamat Tersimpan</h2>
          {(!user?.addresses || user.addresses.length === 0) ? (
            <div className="text-center py-10">
              <MapPin size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Belum ada alamat tersimpan.<br />Alamat akan otomatis disimpan saat checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.addresses.map((addr, i) => (
                <div key={i} className="p-4 rounded-xl border" style={{ borderColor: addr.isDefault ? 'rgba(249,115,22,0.4)' : 'var(--color-border)', background: addr.isDefault ? 'rgba(249,115,22,0.03)' : 'var(--color-bg)' }}>
                  {addr.isDefault && (
                    <span className="text-xs font-semibold text-orange-500 mb-1 block">✓ Alamat Utama</span>
                  )}
                  <p className="text-sm font-medium">{addr.street}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {addr.city}, {addr.province} {addr.postalCode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountPage;
