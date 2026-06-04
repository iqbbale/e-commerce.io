// CartPage
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../../utils/store.utils';
import { cartService } from '../../../service';
import { formatCurrency } from '../../../utils/storage.utils';
import { EmptyState } from '../../ui/index';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, setCart, getTotal, itemCount } = useCartStore();

  const handleUpdate = async (productId: string, qty: number) => {
    try {
      const updated = await cartService.update(productId, qty);
      setCart(updated);
    } catch { toast.error('Gagal memperbarui'); }
  };

  const handleRemove = async (productId: string) => {
    try {
      const updated = await cartService.remove(productId);
      setCart(updated);
      toast.success('Produk dihapus');
    } catch { toast.error('Gagal menghapus'); }
  };

  const handleClear = async () => {
    try {
      await cartService.clear();
      setCart(null);
      toast.success('Keranjang dikosongkan');
    } catch { toast.error('Gagal mengosongkan keranjang'); }
  };

  const subtotal = getTotal();
  const shippingCost = subtotal > 200000 ? 0 : 20000;
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + shippingCost + tax;

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
          Keranjang Belanja
          {itemCount > 0 && (
            <span className="ml-2 text-base font-normal" style={{ color: 'var(--color-text-muted)' }}>
              ({itemCount} item)
            </span>
          )}
        </h1>
        {cart && cart.items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-rose-500 hover:underline"
          >
            Kosongkan
          </button>
        )}
      </div>

      {!cart || cart.items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="Keranjang kosong"
          description="Mulai belanja dan tambahkan produk ke keranjang"
          action={<Link to="/products" className="btn btn-primary">Belanja Sekarang</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const product = item.product as { _id: string; name: string; images: { url: string }[]; slug: string; stock: number };
              return (
                <div key={product._id} className="card p-4 flex items-center gap-4">
                  <Link to={`/products/${product.slug}`}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--color-bg-secondary)' }}>
                      {product.images?.[0]?.url && (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product.slug}`}>
                      <p className="font-semibold hover:text-orange-500 transition-colors line-clamp-1">
                        {product.name}
                      </p>
                    </Link>
                    {item.variant && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.variant}</p>
                    )}
                    <p className="font-bold text-lg mt-1" style={{ color: 'var(--color-primary)', fontFamily: 'Syne, sans-serif' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                        <button
                          onClick={() => handleUpdate(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center disabled:opacity-30 hover:bg-orange-50 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdate(product._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          className="w-8 h-8 flex items-center justify-center disabled:opacity-30 hover:bg-orange-50 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>Ringkasan</h2>
              <div className="space-y-3 mb-5">
                {[
                  { label: 'Subtotal', value: formatCurrency(subtotal) },
                  { label: 'Ongkos Kirim', value: shippingCost === 0 ? 'Gratis 🎉' : formatCurrency(shippingCost) },
                  { label: 'PPN (11%)', value: formatCurrency(tax) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
                    <span className={row.value === 'Gratis 🎉' ? 'text-emerald-500 font-semibold' : ''}>{row.value}</span>
                  </div>
                ))}
                {subtotal < 200000 && (
                  <p className="text-xs p-2 rounded-lg" style={{ background: 'rgba(249,115,22,0.08)', color: 'var(--color-primary)' }}>
                    Tambah {formatCurrency(200000 - subtotal)} lagi untuk gratis ongkir!
                  </p>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-primary)', fontFamily: 'Syne, sans-serif' }}>{formatCurrency(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn btn-primary w-full py-3.5 text-base gap-2">
                Checkout <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="btn btn-ghost w-full mt-2 text-sm">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
