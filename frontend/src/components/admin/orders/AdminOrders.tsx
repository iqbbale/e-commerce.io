import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Eye, CheckCircle, XCircle,
  Truck, Package, ChevronDown,
} from 'lucide-react';
import { IOrder } from '../../../types';
import { orderService } from '../../../service';
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
} from '../../../constants/env';
import { formatCurrency, formatDate } from '../../../utils/storage.utils';
import { Spinner, Modal, Pagination, EmptyState, Badge } from '../../ui/index';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await orderService.getAll({
        page,
        limit: 15,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentFilter }),
      });
      setOrders(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch { toast.error('Gagal memuat pesanan'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, paymentFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = (order: IOrder) => {
    setSelectedOrder(order);
    setAdminNote(order.adminNote || '');
    setTrackingNumber(order.trackingNumber || '');
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setDetailOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      await orderService.updateStatus(selectedOrder._id, {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        adminNote,
        trackingNumber,
      });
      toast.success('Pesanan berhasil diperbarui!');
      setDetailOpen(false);
      fetchOrders();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Gagal memperbarui pesanan');
    } finally { setSaving(false); }
  };

  const quickVerifyPayment = async (orderId: string) => {
    try {
      await orderService.updateStatus(orderId, { paymentStatus: 'paid' });
      toast.success('Pembayaran berhasil dikonfirmasi!');
      fetchOrders();
    } catch { toast.error('Gagal mengkonfirmasi pembayaran'); }
  };

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'pending_payment', label: 'Menunggu Bayar' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'delivered', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  const customer = selectedOrder?.customer as { name?: string; email?: string; phone?: string } | undefined;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            Manajemen Pesanan
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {total.toLocaleString()} pesanan total
          </p>
        </div>
        <button onClick={fetchOrders} className="btn btn-ghost p-2.5" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nomor pesanan..."
            className="input pl-9 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input text-sm appearance-none pr-8"
            style={{ minWidth: 160 }}
          >
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <div className="relative">
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="input text-sm appearance-none pr-8"
            style={{ minWidth: 160 }}
          >
            <option value="">Semua Pembayaran</option>
            <option value="unpaid">Belum Dibayar</option>
            <option value="paid">Sudah Dibayar</option>
            <option value="failed">Gagal</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No. Pesanan</th>
              <th>Pelanggan</th>
              <th>Total</th>
              <th>Pembayaran</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12"><Spinner size={28} /></td></tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12">
                  <EmptyState icon={<Package size={36} />} title="Belum ada pesanan" />
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const cust = order.customer as { name?: string; email?: string } | string;
                const custName = typeof cust === 'object' ? cust.name : '—';
                const custEmail = typeof cust === 'object' ? cust.email : '';
                const isPendingPayment = order.paymentStatus === 'unpaid' && order.paymentProof;

                return (
                  <tr key={order._id}>
                    <td>
                      <div>
                        <p className="text-sm font-semibold font-mono">{order.orderNumber}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {order.items.length} item
                        </p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium">{custName}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{custEmail}</p>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <Badge
                          variant={
                            order.paymentStatus === 'paid' ? 'success' :
                            order.paymentStatus === 'failed' ? 'danger' : 'warning'
                          }
                        >
                          {order.paymentStatus === 'paid' ? 'Dibayar' :
                           order.paymentStatus === 'failed' ? 'Gagal' : 'Belum Dibayar'}
                        </Badge>
                        {isPendingPayment && (
                          <button
                            onClick={() => quickVerifyPayment(order._id)}
                            className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline"
                          >
                            <CheckCircle size={11} /> Verifikasi
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetail(order)}
                          className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-50 transition-colors"
                          title="Lihat & Update"
                        >
                          <Eye size={15} />
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

      {/* ===== ORDER DETAIL MODAL ===== */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Pesanan ${selectedOrder?.orderNumber}`}
        maxWidth="700px"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Pelanggan</p>
                <p className="font-semibold">{customer?.name}</p>
                <p style={{ color: 'var(--color-text-muted)' }}>{customer?.email}</p>
                <p style={{ color: 'var(--color-text-muted)' }}>{customer?.phone}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Pembayaran</p>
                <p className="font-semibold">{PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod]}</p>
                <Badge
                  variant={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}
                >
                  {selectedOrder.paymentStatus === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                </Badge>
                {selectedOrder.paymentDate && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {formatDate(selectedOrder.paymentDate)}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-bg-secondary)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Alamat Pengiriman</p>
              <p className="font-semibold">{selectedOrder.shippingAddress.name}</p>
              <p style={{ color: 'var(--color-text-muted)' }}>
                {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}
              </p>
              <p style={{ color: 'var(--color-text-muted)' }}>{selectedOrder.shippingAddress.phone}</p>
            </div>

            {/* Payment Proof */}
            {selectedOrder.paymentProof && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Bukti Pembayaran</p>
                <a
                  href={selectedOrder.paymentProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Lihat Bukti Pembayaran →
                </a>
              </div>
            )}

            {/* Order Items */}
            <div>
              <p className="text-sm font-semibold mb-3">Item Pesanan</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-border)' }}>
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.variant && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.variant}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="mt-3 p-3 rounded-xl space-y-1.5" style={{ background: 'var(--color-bg-secondary)' }}>
                {[
                  { label: 'Subtotal', value: formatCurrency(selectedOrder.subtotal) },
                  { label: 'Ongkos Kirim', value: formatCurrency(selectedOrder.shippingCost) },
                  { label: 'Pajak (11%)', value: formatCurrency(selectedOrder.tax) },
                  ...(selectedOrder.discount > 0 ? [{ label: 'Diskon', value: `-${formatCurrency(selectedOrder.discount)}` }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-sm font-bold">Update Pesanan</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Status Pesanan</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input text-sm"
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Status Pembayaran</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="unpaid">Belum Dibayar</option>
                    <option value="paid">Sudah Dibayar ✓</option>
                    <option value="failed">Gagal</option>
                    <option value="refunded">Dikembalikan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">No. Resi Pengiriman</label>
                <div className="relative">
                  <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="input text-sm pl-9"
                    placeholder="Masukkan nomor resi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Catatan Admin (Internal)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="input text-sm"
                  rows={2}
                  placeholder="Catatan untuk tim internal..."
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDetailOpen(false)}
                  className="btn btn-secondary flex-1"
                  disabled={saving}
                >
                  Tutup
                </button>
                <button
                  onClick={handleUpdateOrder}
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? <Spinner size={16} /> : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;
