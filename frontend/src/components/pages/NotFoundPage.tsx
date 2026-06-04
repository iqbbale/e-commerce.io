import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <div className="text-center px-6 max-w-lg">
        {/* Big 404 */}
        <div
          className="text-[120px] font-black leading-none mb-4 select-none"
          style={{
            fontFamily: 'Syne, sans-serif',
            background: 'linear-gradient(135deg, #f97316, #ea580c, #dc2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          Coba kembali ke beranda atau cari produk lainnya.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn btn-primary gap-2 px-6 py-3 w-full sm:w-auto">
            <Home size={16} /> Kembali ke Beranda
          </Link>
          <Link to="/products" className="btn btn-secondary gap-2 px-6 py-3 w-full sm:w-auto">
            <Search size={16} /> Cari Produk
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm mt-6 mx-auto transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={14} /> Kembali ke halaman sebelumnya
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
