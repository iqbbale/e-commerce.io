import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8" }}>
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                }}
              >
                <ShoppingBag size={20} className="text-white" />
              </div>
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                NovaMart
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Platform belanja online terpercaya dengan ribuan produk pilihan.
              Kualitas terjamin, harga terbaik.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    color: "#f97316",
                  }}
                  onMouseEnter={(e) => (
                    (e.currentTarget.style.background = "#f97316"),
                    (e.currentTarget.style.color = "white")
                  )}
                  onMouseLeave={(e) => (
                    (e.currentTarget.style.background = "rgba(249,115,22,0.1)"),
                    (e.currentTarget.style.color = "#f97316")
                  )}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-white font-semibold mb-4"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Belanja
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "/products", label: "Semua Produk" },
                { to: "/products?featured=true", label: "Produk Unggulan" },
                { to: "/products?sort=popular", label: "Terpopuler" },
                { to: "/products?sort=newest", label: "Terbaru" },
                { to: "/products?inStock=true", label: "Stok Tersedia" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm transition-colors hover:text-orange-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4
              className="text-white font-semibold mb-4"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Bantuan
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Cara Pemesanan" },
                { label: "Cara Pembayaran" },
                { label: "Status Pesanan" },
                { label: "Pengembalian Barang" },
                { label: "FAQ" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href="#"
                    className="text-sm transition-colors hover:text-orange-400"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white font-semibold mb-4"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Kontak
            </h4>
            <ul className="space-y-3">
              {[
                { icon: Mail, text: "support@novamart.id" },
                { icon: Phone, text: "+62 811-2345-6789" },
                { icon: MapPin, text: "Surabaya, Jawa Timur, Indonesia" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon
                    size={15}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "#f97316" }}
                  />
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-white mb-3">Subscribe Newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email kamu"
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#f97316" }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t py-5"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© 2025 NovaMart. Semua hak dilindungi.</p>
          <div className="flex items-center gap-4">
            {["Privasi", "Syarat & Ketentuan", "Keamanan"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs hover:text-orange-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
