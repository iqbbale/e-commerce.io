import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package,
  Users, DollarSign, AlertTriangle, Eye,
} from 'lucide-react';
import { dashboardService } from '../../../service';
import { IDashboardStats, IMonthlyRevenue, IDailyRevenue } from '../../../types';
import { formatCurrency } from '../../../utils/storage.utils';
import { Spinner, TextSkeleton } from '../../ui/index';

const PIE_COLORS = ['#f59e0b', '#10b981', '#8b5cf6', '#3b82f6', '#f43f5e', '#6b7280'];

const StatCard = ({
  label, value, icon: Icon, trend, trendValue, color = '#f97316',
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
}) => (
  <div className="card p-5 flex items-center gap-4">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15` }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium mb-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
      {trendValue && (
        <div className="flex items-center gap-1 mt-0.5">
          {trend === 'up' ? (
            <TrendingUp size={12} style={{ color: '#10b981' }} />
          ) : (
            <TrendingDown size={12} style={{ color: '#f43f5e' }} />
          )}
          <span
            className="text-xs font-medium"
            style={{ color: trend === 'up' ? '#10b981' : '#f43f5e' }}
          >
            {trendValue}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>vs bulan lalu</span>
        </div>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<IMonthlyRevenue | null>(null);
  const [dailyData, setDailyData] = useState<IDailyRevenue | null>(null);
  const [topProducts, setTopProducts] = useState<{ name: string; soldCount: number; price: number }[]>([]);
  const [statusDist, setStatusDist] = useState<{ _id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeChart, setActiveChart] = useState<'monthly' | 'daily'>('monthly');

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, monthly, top, status] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getMonthlyRevenue(selectedYear),
          dashboardService.getTopProducts(),
          dashboardService.getOrderStatusDistribution(),
        ]);
        setStats(s);
        setMonthlyData(monthly);
        setTopProducts(top || []);
        setStatusDist(status || []);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    load();
  }, [selectedYear]);

  useEffect(() => {
    dashboardService.getDailyRevenue(selectedYear, selectedMonth)
      .then(setDailyData)
      .catch(() => {});
  }, [selectedYear, selectedMonth]);

  const orderStatusLabels: Record<string, string> = {
    pending_payment: 'Menunggu Bayar',
    paid: 'Dibayar',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Selesai',
    cancelled: 'Dibatalkan',
    refunded: 'Refund',
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 text-sm shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: '#f97316' }}>
            {p.name === 'revenue' ? formatCurrency(p.value) : `${p.value} pesanan`}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5"><TextSkeleton lines={3} /></div>
          ))}
        </div>
        <div className="flex items-center justify-center h-48"><Spinner size={32} /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Selamat datang! Berikut ringkasan aktivitas toko Anda.
        </p>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Pendapatan"
          value={formatCurrency(stats?.revenue.total || 0)}
          icon={DollarSign}
          color="#f97316"
        />
        <StatCard
          label="Pendapatan Bulan Ini"
          value={formatCurrency(stats?.revenue.thisMonth || 0)}
          icon={TrendingUp}
          color="#10b981"
          trend={stats?.revenue.growth !== undefined ? (stats.revenue.growth >= 0 ? 'up' : 'down') : undefined}
          trendValue={stats?.revenue.growth !== undefined ? `${Math.abs(stats.revenue.growth).toFixed(1)}%` : undefined}
        />
        <StatCard
          label="Total Pesanan"
          value={(stats?.orders.total || 0).toLocaleString()}
          icon={ShoppingCart}
          color="#8b5cf6"
        />
        <StatCard
          label="Total Pelanggan"
          value={(stats?.customers.total || 0).toLocaleString()}
          icon={Users}
          color="#0ea5e9"
        />
      </div>

      {/* Alerts */}
      {(stats?.orders.pending ?? 0) > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}
        >
          <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p className="text-sm">
            <span className="font-semibold">{stats?.orders.pending} pesanan</span>
            {' '}menunggu konfirmasi pembayaran.
          </p>
        </div>
      )}
      {(stats?.products.lowStock ?? 0) > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: 'rgba(244,63,94,0.06)', borderColor: 'rgba(244,63,94,0.2)' }}
        >
          <Package size={18} style={{ color: '#f43f5e', flexShrink: 0 }} />
          <p className="text-sm">
            <span className="font-semibold">{stats?.products.lowStock} produk</span>
            {' '}memiliki stok rendah dan perlu diisi.
          </p>
        </div>
      )}

      {/* ===== REVENUE CHART ===== */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>Grafik Penjualan</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Hanya menampilkan pesanan yang sudah dibayar
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Period toggle */}
            <div
              className="flex rounded-xl overflow-hidden border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {(['monthly', 'daily'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveChart(t)}
                  className="px-4 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: activeChart === t ? '#f97316' : 'transparent',
                    color: activeChart === t ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {t === 'monthly' ? 'Bulanan' : 'Harian'}
                </button>
              ))}
            </div>

            {/* Year selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input text-xs py-1.5 px-3"
              style={{ width: 'auto' }}
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            {/* Month selector (daily only) */}
            {activeChart === 'daily' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="input text-xs py-1.5 px-3"
                style={{ width: 'auto' }}
              >
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          {activeChart === 'monthly' ? (
            <AreaChart data={monthlyData?.months || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="monthName" tick={{ fontSize: 11 }} stroke="var(--color-border)" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--color-border)"
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          ) : (
            <BarChart data={dailyData?.days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--color-border)" />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="var(--color-border)"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ===== BOTTOM CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
            Distribusi Status Pesanan
          </h2>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusDist.map((d) => ({
                    name: orderStatusLabels[d._id] || d._id,
                    value: d.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusDist.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Belum ada data
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
              Produk Terlaris
            </h2>
            <Eye size={16} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div className="space-y-3">
            {topProducts.slice(0, 6).map((prod, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                  style={{ background: idx < 3 ? '#f97316' : 'var(--color-bg-tertiary)', color: idx < 3 ? 'white' : 'var(--color-text-muted)' }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{prod.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {prod.soldCount} terjual · {formatCurrency(prod.price)}
                  </p>
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.max(8, (prod.soldCount / (topProducts[0]?.soldCount || 1)) * 80)}px`,
                    background: '#f97316',
                  }}
                />
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                Belum ada penjualan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
