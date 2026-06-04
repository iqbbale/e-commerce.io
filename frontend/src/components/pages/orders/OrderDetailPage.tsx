import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, Truck, Package } from 'lucide-react';
import { IOrder } from '../../../types';
import { orderService } from '../../../service';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS } from '../../../constants/env';
import { formatCurrency, formatDate } from '../../../utils/storage.utils';
import { Spinner, Badge } from '../../ui/index';
import toast from 'react-hot-toast';

const ORDER_STEPS = [
  { status: 'pending_payment', label: 'Menunggu Pembayaran', icon: '💳' },
  { status: 'paid', label: 'Pembayaran Dikonfirmasi', icon: '✅' },
  { status: 'processing', label: 'Pesanan Diproses', icon: '📦' },
  { status: 'shipped', label: 'Pesanan Dikirim', icon: '🚚' },
  { status: 'delivered', label: 'Pesanan Diterima', icon: '🎉' },
];

const STATUS_ORDER = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderService.getById(id)
      .then(setOrder)
      .catch(() => toast.error('Pesanan tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUploadProof = async () => {
    if (!paymentProofUrl.trim() || !id) return;
    setUploading(true);
    try {
      const updated = await orderService.uploadPaymentProof(id, paymentProofUrl);
      setOrder(updated);
      setPaymentProofUrl('');
      toast.success('Bukti pembayaran berhasil dikirim! Admin akan memverifikasi segera.');
    } catch { toast.error('Gagal mengirim bukti pembayaran'); }
    finally { setUploading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>;
  if (!order) return (
    <div className="container-custom py-16 text-center">
      <p className="text-lg font-semibold mb-4">Pesanan tidak ditemukan</p>
      <Link to="/orders" className="btn btn-primary">Kembali ke Pesanan</Link>
    </div>
  );

  const currentStep = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container-custom py-8 max-w-3xl animate-fade-in">
      {/* Back */}
      <Link to="/orders" className="flex items-center gap-2 text-sm mb-6 hover:text-orange-500 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={16} /> Kembali ke pesanan
      </Link>

      {/* Header */}
      <div className="card p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-mono font-semibold text-lg">{order.orderNumber}</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Dibuat {formatDate(order.createdAt)}
            </p>
          </div>
          <span className={`badge text-sm self-start sm:self-center ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      {/* ===== ORDER TRACKING ===== */}
      {!isCancelled && (
        <div className="card p-5 mb-5">
          <h3 className="font-bold mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Pelacakan Pesanan</h3>
          <div className="relative">
            {/* Track line */}
            <div
              className="absolute left-4 top-4 bottom-4 w-0.5"
              style={{ background: 'var(--color-border)' }}
            />
            <div
              className="absolute left-4 top-4 w-0.5 transition-all duration-500"
              style={{
                height: currentStep <= 0 ? '0%' : `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%`,
                background: 'linear-gradient(180deg, #f97316, #ea580c)',
              }}
            />
            <div className="space-y-4 relative">
              {ORDER_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.status} className="flex items-center gap-4 relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm z-10 transition-all"
                      style={{
                        background: isCompleted ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'var(--color-bg-secondary)',
                        border: isCurrent ? '2px solid #f97316' : '2px solid var(--color-border)',
                        boxShadow: isCurrent ? '0 0 12px rgba(249,115,22,0.4)' : 'none',
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle size={14} className="text-white" />
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${isCompleted ? '' : ''}`}
                        style={{ color: isCompleted ? 'var(--color-text)' : 'var(--color-text-muted)' }}
                      >
                        {step.icon} {step.label}
                      </p>
                      {step.status === 'shipped' && order.trackingNumber && isCompleted && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-primary)' }}>
                          Resi: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="card p-4 mb-5 border-rose-200 bg-rose-50">
          <p className="text-rose-600 font-semibold text-sm">❌ Pesanan Dibatalkan</p>
          {order.cancelReason && (
            <p className="text-xs mt-1 text-rose-500">{order.cancelReason}</p>
          )}
        </div>
      )}

      {/* ===== PAYMENT SECTION ===== */}
      {order.status === 'pending_payment' && order.paymentStatus === 'unpaid' && (
        <div
          className="card p-5 mb-5"
          style={{ borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.03)' }}
        >
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--color-primary)' }}>
            <Upload size={16} /> Upload Bukti Pembayaran
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Silakan transfer ke rekening berikut, lalu upload bukti pembayaran:
          </p>
          {/* Bank details */}
          <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: 'var(--color-bg-secondary)' }}>
            <p className="font-semibold mb-1">BCA - 1234567890</p>
            <p style={{ color: 'var(--color-text-muted)' }}>a.n. PT NovaMart Indonesia</p>
            <p className="text-lg font-bold mt-2" style={{ color: 'var(--color-primary)', fontFamily: 'Syne, sans-serif' }}>
              {formatCurrency(order.total)}
            </p>
          </div>
          {order.paymentProof ? (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle size={16} style={{ color: '#10b981' }} />
              <p className="text-sm font-medium text-emerald-700">Bukti pembayaran terkirim — menunggu verifikasi admin</p>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                value={paymentProofUrl}
                onChange={(e) => setPaymentProofUrl(e.target.value)}
                className="input text-sm"
                placeholder="Tempel URL screenshot bukti transfer..."
              />
              <button
                onClick={handleUploadProof}
                disabled={!paymentProofUrl.trim() || uploading}
                className="btn btn-primary w-full gap-2"
              >
                {uploading ? <Spinner size={16} /> : <><Upload size={14} /> Kirim Bukti Pembayaran</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin Note */}
      {order.adminNote && (
        <div className="card p-4 mb-5" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.04)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#8b5cf6' }}>Catatan dari Kami</p>
          <p className="text-sm">{order.adminNote}</p>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-5">
        <h3 className="font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Item Pesanan</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--color-bg-secondary)' }}>
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.variant && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.variant}</p>}
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="text-sm font-bold flex-shrink-0">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
          {[
            { label: 'Subtotal', value: formatCurrency(order.subtotal) },
            { label: 'Ongkos Kirim', value: formatCurrency(order.shippingCost) },
            { label: 'PPN (11%)', value: formatCurrency(order.tax) },
            ...(order.discount > 0 ? [{ label: 'Diskon', value: `-${formatCurrency(order.discount)}` }] : []),
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <span>Total Bayar</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--color-text-muted)' }}>Metode Pembayaran</span>
            <span>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="card p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <Truck size={16} /> Alamat Pengiriman
        </h3>
        <p className="text-sm font-semibold">{order.shippingAddress.name}</p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {order.shippingAddress.phone}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
          {order.shippingAddress.province} {order.shippingAddress.postalCode}
        </p>
      </div>
    </div>
  );
};

export default OrderDetailPage;
