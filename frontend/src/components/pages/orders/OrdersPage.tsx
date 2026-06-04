import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { IOrder } from '../../../types';
import { orderService } from '../../../service';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../../constants/env';
import { formatCurrency, formatDate } from '../../../utils/storage.utils';
import { Spinner, EmptyState, Pagination } from '../../ui/index';

const ORDER_STATUS_TABS = [
  { value: '', label: 'Semua' },
  { value: 'pending_payment', label: 'Menunggu Bayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await orderService.getMyOrders({ page, limit: 10, status: status || undefined });
        setOrders(result.data || []);
        setTotal(result.pagination?.total || 0);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch { setOrders([]); } finally { setLoading(false); }
    };
    fetch();
  }, [page, status]);

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
        Pesanan Saya
      </h1>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {ORDER_STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: status === tab.value ? '#f97316' : 'var(--color-bg-secondary)',
              color: status === tab.value ? 'white' : 'var(--color-text-muted)',
              border: `1px solid ${status === tab.value ? '#f97316' : 'var(--color-border)'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title="Belum ada pesanan"
          description="Mulai belanja dan pesanan Anda akan muncul di sini"
          action={<Link to="/products" className="btn btn-primary">Belanja Sekarang</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card p-5 block hover:border-orange-300 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold font-mono text-sm">{order.orderNumber}</p>
                    <span className={`badge text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={10} className="inline mr-1" />
                    {formatDate(order.createdAt)} · {order.items.length} item
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: 'var(--color-primary)', fontFamily: 'Syne, sans-serif' }}>
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs" style={{ color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                      {order.paymentStatus === 'paid' ? '✓ Dibayar' : 'Menunggu pembayaran'}
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              {/* Item previews */}
              <div className="flex gap-2 mt-3 pt-3 border-t overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                {order.items.slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{ background: 'var(--color-bg-secondary)' }}
                  >
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-semibold"
                    style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}
                  >
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
