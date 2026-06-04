import { Outlet, Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const STATS = [
  { label: "Produk", value: "10K+" },
  { label: "Pelanggan", value: "50K+" },
  { label: "Kota", value: "100+" },
];

const AuthLayout = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--color-bg)",
    }}
  >
    {/* ===== LEFT PANEL ===== */}
    <div
      style={{
        display: "none",
        width: "45%",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
      }}
      className="lg-flex-block"
    >
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(rgba(249,115,22,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Glow circles */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(249,115,22,.18) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(234,88,12,.14) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "3rem 3.5rem",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 56,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg,#f97316,#ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShoppingBag size={24} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: "Syne,sans-serif",
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            NovaMart
          </span>
        </Link>

        <h2
          style={{
            fontFamily: "Syne,sans-serif",
            fontSize: "2rem",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.25,
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          Belanja Lebih Mudah,{" "}
          <span
            style={{
              background: "linear-gradient(135deg,#fb923c,#f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Lebih Nyaman
          </span>
        </h2>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "1rem",
            lineHeight: 1.7,
            marginBottom: 40,
            maxWidth: 340,
          }}
        >
          Temukan ribuan produk pilihan dengan kualitas terbaik. Pengiriman
          cepat, harga terjangkau, dan layanan terpercaya.
        </p>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
            width: "100%",
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                padding: "16px 12px",
                borderRadius: 12,
                textAlign: "center",
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
            >
              <p
                style={{
                  fontFamily: "Syne,sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#fb923c",
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ===== RIGHT PANEL (FORM) ===== */}
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
        overflowY: "auto",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Mobile logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 36,
            textDecoration: "none",
          }}
          className="lg-hidden"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg,#f97316,#ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingBag size={18} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: "Syne,sans-serif",
              fontSize: "1.35rem",
              fontWeight: 800,
            }}
          >
            NovaMart
          </span>
        </Link>

        <Outlet />
      </div>
    </div>

    <style>{`
      @media(min-width:1024px) {
        .lg-flex-block { display:flex !important; }
        .lg-hidden { display:none !important; }
      }
    `}</style>
  </div>
);

export default AuthLayout;
