import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  LogOut, Menu, X, ShoppingBag, Bell, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../utils/store.utils';
import { authService } from '../../service/auth.service';
import toast from 'react-hot-toast';
import { getInitials } from '../../utils/storage.utils';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products', icon: Package, label: 'Produk' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Pesanan' },
  { path: '/admin/users', icon: Users, label: 'Pengguna' },
  { path: '/admin/categories', icon: Tag, label: 'Kategori' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login');
      toast.success('Berhasil logout');
    } catch {
      logout();
      navigate('/login');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            <ShoppingBag size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
              NovaMart
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p
          className="text-xs font-semibold uppercase tracking-wider px-3 mb-2"
          style={{ color: 'var(--color-text-muted)', display: sidebarOpen ? 'block' : 'none' }}
        >
          Menu Utama
        </p>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {sidebarOpen && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-2"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              {user ? getInitials(user.name) : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>Admin</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left hover:text-rose-500"
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 border-r transition-all duration-300"
        style={{
          width: sidebarOpen ? '240px' : '64px',
          borderColor: 'var(--color-border)',
          background: 'var(--color-card)',
        }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-20 -right-3 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            zIndex: 10,
          }}
        >
          <ChevronRight
            size={12}
            style={{
              transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s',
            }}
          />
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden overlay"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 h-full w-60 z-50 lg:hidden border-r flex flex-col"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
        >
          <button
            className="lg:hidden btn btn-ghost p-2"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{ background: 'var(--color-bg-secondary)' }}
            >
              <Bell size={16} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: '#f97316' }}
              />
            </button>

            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              {user ? getInitials(user.name) : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
