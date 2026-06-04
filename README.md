# 🛍️ NovaMart — E-Commerce Full-Stack

Platform e-commerce modern dibangun dengan **MERN Stack + TypeScript**, menghadirkan pengalaman belanja premium untuk customer dan panel admin yang lengkap.

---

## 🚀 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB, Mongoose |
| **State Management** | Zustand + TanStack Query |
| **Auth** | JWT (Access + Refresh Token) |
| **Charts** | Recharts |
| **Forms** | React Hook Form |
| **HTTP Client** | Axios |

---

## 📁 Struktur Proyek

```
novamart-ecommerce/
├── backend/
│   └── src/
│       ├── models/          # MongoDB models (User, Product, Order, Cart, Category, Review)
│       ├── utils/           # Actions/handlers (auth, product, order, cart, dashboard)
│       ├── middleware/       # Auth & validation middleware
│       ├── routes/          # API routes (admin & customer)
│       ├── config/          # Database config
│       └── scripts/         # Seed database
│
└── frontend/
    └── src/
        ├── components/
        │   ├── pages/       # Halaman customer (home, products, cart, checkout, orders, auth)
        │   ├── admin/       # Halaman admin (dashboard, products, orders, users, categories)
        │   ├── ui/          # Komponen reusable (Navbar, Footer, CartDrawer, Modal, dll)
        │   └── layout/      # Layout templates (Main, Admin, Auth)
        ├── constants/       # Environment variables & constants
        ├── routes/          # React Router + ProtectedRoute + AdminRoute + GuestRoute
        ├── service/         # API service calls (auth, product, order, cart, dashboard)
        ├── styles/          # CSS global & CSS Modules per komponen
        ├── types/           # TypeScript interfaces & types
        └── utils/           # localStorage utils, axios instance, Zustand stores
```

---

## ⚡ Quick Start

### 1. Prasyarat
- Node.js v18+
- MongoDB (lokal atau MongoDB Atlas)
- npm atau yarn

### 2. Clone & Install

```bash
# Install dependencies semua sekaligus
npm install          # root
cd backend && npm install
cd ../frontend && npm install
```

### 3. Setup Environment Variables

**Backend** — buat file `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=Admin@123456
```

**Frontend** — buat file `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=NovaMart
```

### 4. Seed Database (Opsional)

```bash
cd backend
npx ts-node src/scripts/seed.ts
```

Ini akan membuat:
- ✅ Admin account (`admin@ecommerce.com` / `Admin@123456`)
- ✅ 8 kategori produk
- ✅ 6 sample produk

### 5. Jalankan Development Server

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Akses:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health**: http://localhost:5000/api/health

---

## 👥 Dua Role Pengguna

### 🛒 Customer
| Fitur | Deskripsi |
|-------|-----------|
| Registrasi & Login | JWT dengan refresh token otomatis |
| Jelajahi Produk | Filter, pencarian, sorting, pagination |
| Keranjang Belanja | Real-time cart dengan drawer sidebar |
| Wishlist | Simpan produk favorit |
| Checkout | Form alamat + pilihan metode pembayaran |
| Upload Bukti Bayar | Customer upload, admin verifikasi |
| Lacak Pesanan | Timeline visual status pesanan |
| Riwayat Pesanan | Filter by status, detail lengkap |
| Profil | Edit profil, ganti password, kelola alamat |

### 🔐 Admin
| Fitur | Deskripsi |
|-------|-----------|
| Dashboard | Statistik real-time + 4 jenis chart |
| Grafik Penjualan | Monthly/Daily/Yearly — HANYA pesanan TERBAYAR |
| CRUD Produk | Create, Read, Update, Delete (soft delete) |
| Manajemen Pesanan | Verifikasi pembayaran, update status, no. resi |
| Manajemen Pengguna | Lihat semua user, aktifkan/nonaktifkan akun |
| Manajemen Kategori | CRUD kategori produk |
| Proteksi Route | Customer tidak bisa akses halaman admin |

---

## 📊 Dashboard Admin — Chart Details

Semua chart **hanya menampilkan pesanan yang sudah dikonfirmasi pembayarannya** (`paymentStatus: 'paid'`):

- **Area Chart** — Pendapatan bulanan per tahun
- **Bar Chart** — Pendapatan harian per bulan
- **Pie Chart** — Distribusi status pesanan
- **Top Products** — Produk dengan penjualan terbanyak

> ⚠️ Pesanan di keranjang, checkout tapi belum bayar, atau menunggu verifikasi **TIDAK dihitung** dalam revenue chart.

---

## 🔐 Flow Pembayaran

```
Customer Checkout → Pesanan Dibuat (status: pending_payment)
       ↓
Customer Upload Bukti Transfer (URL screenshot)
       ↓
Admin Verifikasi di Panel → Konfirmasi Pembayaran
       ↓
Pesanan Status: paid → processing → shipped → delivered
       ↓
Revenue tercatat di Dashboard Chart ✅
```

---

## 🛡️ Keamanan

- JWT Access Token (7 hari) + Refresh Token (30 hari)
- Auto-refresh token saat expired
- Route protection: Customer ↔ Admin dipisah ketat
- Rate limiting (200 req / 15 menit)
- Helmet.js security headers
- Input validation dengan express-validator
- Password hashing dengan bcrypt (salt 12)

---

## 📡 API Endpoints

```
Auth:        POST /api/auth/register|login|logout|refresh | GET /api/auth/me
Products:    GET /api/products | GET /api/products/:slug | POST|PUT|DELETE (admin)
Categories:  GET /api/categories | POST|PUT|DELETE (admin)
Cart:        GET|POST /api/cart | PUT|DELETE /api/cart/item/:id
Orders:      POST /api/orders | GET /api/orders/my-orders | GET|PATCH /api/orders/:id
Admin:       GET /api/admin/users | PATCH /api/admin/users/:id/toggle-status
Dashboard:   GET /api/dashboard/stats|revenue/monthly|revenue/daily|products/top
Reviews:     GET /api/reviews/product/:id | POST /api/reviews
```

---

## 🎨 Design System

- **Primary**: Orange (#f97316)
- **Font**: Plus Jakarta Sans + Syne (display)
- **Radius**: 8px / 12px / 16px
- **Animation**: fade-in, slide-up, float, pulse-glow
- **CSS**: Tailwind CSS + CSS Modules per komponen
- **Dark Mode Ready**: CSS variables untuk theming

---

## 📦 Deployment

**Backend** (Railway / Render / VPS):
```bash
cd backend
npm run build
npm start
```

**Frontend** (Vercel / Netlify):
```bash
cd frontend
npm run build
# Upload folder dist/
```

---

## 🤝 Kontribusi

Pull request dan issue sangat disambut. Pastikan mengikuti TypeScript strict mode dan coding style yang ada.

---

**Dibuat dengan ❤️ menggunakan MERN Stack + TypeScript**
