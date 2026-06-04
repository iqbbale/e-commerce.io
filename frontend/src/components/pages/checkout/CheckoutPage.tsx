import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCartStore, useAuthStore } from '../../../utils/store.utils';
import { orderService } from '../../../service';
import { ICheckoutForm } from '../../../types';
import { PAYMENT_METHOD_LABELS } from '../../../constants/env';
import { formatCurrency } from '../../../utils/storage.utils';
import { Spinner } from '../../ui/index';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, setCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ICheckoutForm>({
    defaultValues: {
      shippingAddress: {
        country: 'Indonesia',
        name: user?.name || '',
        phone: user?.phone || '',
      },
      paymentMethod: 'bank_transfer',
      shippingCost: 20000,
      discount: 0,
    },
  });

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  if (!cart || cart.items.length === 0) return null;

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 20000;
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + shippingCost + tax;

  const onSubmit = async (data: ICheckoutForm) => {
    setIsSubmitting(true);
    try {
      const items = cart.items.map((item) => ({
        productId: (item.product as { _id: string })._id,
        quantity: item.quantity,
        variant: item.variant,
      }));

      const order = await orderService.create({
        ...data,
        items,
        shippingCost,
        discount: 0,
      });

      setCart(null);
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/orders/${order._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8 animate-fade-in">
      <Link to="/cart" className="flex items-center gap-2 text-sm mb-6 hover:text-orange-500 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={16} /> Kembali ke keranjang
      </Link>

      <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ===== LEFT: FORM ===== */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
                📍 Alamat Pengiriman
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Nama Penerima *</label>
                  <input
                    {...register('shippingAddress.name', { required: 'Nama wajib diisi' })}
                    className="input text-sm"
                    placeholder="Nama lengkap penerima"
                  />
                  {errors.shippingAddress?.name && (
                    <p className="text-rose-500 text-xs mt-1">{errors.shippingAddress.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">No. Telepon *</label>
                  <input
                    {...register('shippingAddress.phone', { required: 'No. telepon wajib diisi' })}
                    type="tel"
                    className="input text-sm"
                    placeholder="08xxxxxxxxxx"
                  />
                  {errors.shippingAddress?.phone && (
                    <p className="text-rose-500 text-xs mt-1">{errors.shippingAddress.phone.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">Alamat Lengkap *</label>
                  <textarea
                    {...register('shippingAddress.street', { required: 'Alamat wajib diisi' })}
                    className="input text-sm"
                    rows={2}
                    placeholder="Jalan, no. rumah, RT/RW, kelurahan"
                    style={{ resize: 'none' }}
                  />
                  {errors.shippingAddress?.street && (
                    <p className="text-rose-500 text-xs mt-1">{errors.shippingAddress.street.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Kota *</label>
                  <input
                    {...register('shippingAddress.city', { required: true })}
                    className="input text-sm"
                    placeholder="Kota/Kabupaten"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Provinsi *</label>
                  <input
                    {...register('shippingAddress.province', { required: true })}
                    className="input text-sm"
                    placeholder="Provinsi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Kode Pos *</label>
                  <input
                    {...register('shippingAddress.postalCode', { required: true })}
                    className="input text-sm"
                    placeholder="60xxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Negara</label>
                  <input
                    {...register('shippingAddress.country')}
                    className="input text-sm"
                    defaultValue="Indonesia"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
                💳 Metode Pembayaran
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      {...register('paymentMethod', { required: true })}
                      value={value}
                      className="sr-only peer"
                    />
                    <div
                      className="p-3 rounded-xl border-2 transition-all peer-checked:border-orange-400 peer-checked:bg-orange-50"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <p className="text-sm font-semibold">{label}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Note */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                📝 Catatan (Opsional)
              </h2>
              <textarea
                {...register('customerNote')}
                className="input text-sm"
                rows={3}
                placeholder="Catatan khusus untuk penjual..."
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          {/* ===== RIGHT: SUMMARY ===== */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
                🛒 Ringkasan Pesanan
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-5">
                {cart.items.map((item) => {
                  const product = item.product as { name: string; images: { url: string }[] };
                  return (
                    <div key={(item.product as { _id: string })._id} className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: 'var(--color-bg-secondary)' }}
                      >
                        {product.images?.[0]?.url && (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold flex-shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price summary */}
              <div className="space-y-2.5 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                {[
                  { label: 'Subtotal', value: formatCurrency(subtotal) },
                  { label: 'Ongkos Kirim', value: formatCurrency(shippingCost) },
                  { label: 'PPN (11%)', value: formatCurrency(tax) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t font-bold" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-base">Total</span>
                  <span className="text-xl" style={{ color: 'var(--color-primary)', fontFamily: 'Syne, sans-serif' }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full py-4 text-base mt-6 gap-2"
              >
                {isSubmitting ? (
                  <Spinner size={18} />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Buat Pesanan
                  </>
                )}
              </button>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-muted)' }}>
                Dengan memesan, Anda menyetujui syarat & ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
