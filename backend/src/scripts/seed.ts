import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce_db";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ecommerce.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";

const CATEGORIES = [
  {
    name: "Elektronik",
    description: "Gadget & perangkat elektronik",
    sortOrder: 1,
  },
  { name: "Fashion", description: "Pakaian, sepatu & aksesori", sortOrder: 2 },
  { name: "Rumah & Dapur", description: "Perabot rumah tangga", sortOrder: 3 },
  { name: "Kecantikan", description: "Kosmetik & perawatan", sortOrder: 4 },
  { name: "Olahraga", description: "Peralatan olahraga", sortOrder: 5 },
  { name: "Buku", description: "Buku & alat tulis", sortOrder: 6 },
  { name: "Makanan & Minuman", description: "Produk pangan", sortOrder: 7 },
  { name: "Otomotif", description: "Aksesori kendaraan", sortOrder: 8 },
];

const seed = async () => {
  console.log("\n🌱 Seeding database...");
  console.log(
    "🔑 JWT_SECRET:",
    process.env.JWT_SECRET ? "✅ loaded" : "❌ MISSING",
  );
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db!;
  const usersCol = db.collection("users");
  const categoriesCol = db.collection("categories");
  const productsCol = db.collection("products");

  // ADMIN
  const existAdmin = await usersCol.findOne({ role: "admin" });
  if (!existAdmin) {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);
    const now = new Date();
    await usersCol.insertOne({
      name: "Admin NovaMart",
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
      phone: "",
      avatar: "",
      isActive: true,
      isEmailVerified: true,
      wishlist: [],
      addresses: [],
      refreshToken: null,
      createdAt: now,
      updatedAt: now,
    });
    console.log("✅ Admin created:", ADMIN_EMAIL);
  } else {
    console.log("ℹ️  Admin exists:", ADMIN_EMAIL);
  }

  // CATEGORIES
  const catMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of CATEGORIES) {
    const ex = await categoriesCol.findOne({ name: cat.name });
    if (!ex) {
      const now = new Date();
      const res = await categoriesCol.insertOne({
        ...cat,
        isActive: true,
        slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        createdAt: now,
        updatedAt: now,
      });
      catMap[cat.name] = res.insertedId as unknown as mongoose.Types.ObjectId;
      console.log("✅ Category:", cat.name);
    } else {
      catMap[cat.name] = ex._id as unknown as mongoose.Types.ObjectId;
    }
  }

  // PRODUCTS
  const prodCount = await productsCol.countDocuments();
  if (prodCount === 0) {
    const admin = await usersCol.findOne({ role: "admin" });
    const now = new Date();
    const products = [
      {
        name: "Smartphone ProMax X15",
        price: 8999000,
        comparePrice: 12000000,
        stock: 50,
        isFeatured: true,
        category: catMap["Elektronik"],
        tags: ["smartphone", "android"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop",
          },
        ],
        description:
          "Smartphone flagship dengan layar AMOLED 6.7 inci, kamera 200MP, baterai 5000mAh.",
        shortDescription: "Smartphone flagship kamera 200MP",
        soldCount: 120,
      },
      {
        name: "Laptop UltraBook Pro 14",
        price: 14500000,
        comparePrice: 17000000,
        stock: 25,
        isFeatured: true,
        category: catMap["Elektronik"],
        tags: ["laptop", "professional"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop",
          },
        ],
        description: "Laptop ultra-tipis, RAM 16GB, SSD 512GB, layar 2K IPS.",
        shortDescription: "Laptop tipis performa tinggi",
        soldCount: 85,
      },
      {
        name: "Headphone Wireless ANC Pro",
        price: 1299000,
        comparePrice: 1800000,
        stock: 40,
        isFeatured: true,
        category: catMap["Elektronik"],
        tags: ["headphone", "wireless"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop",
          },
        ],
        description: "Headphone wireless ANC, baterai 30 jam, Bluetooth 5.3.",
        shortDescription: "Headphone wireless 30 jam baterai",
        soldCount: 200,
      },
      {
        name: "Sepatu Lari AeroRun Elite",
        price: 899000,
        comparePrice: 1200000,
        stock: 100,
        isFeatured: true,
        category: catMap["Olahraga"],
        tags: ["sepatu", "lari"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
          },
        ],
        description: "Sepatu lari premium cushioning terbaru, anti-slip.",
        shortDescription: "Sepatu lari premium anti-slip",
        soldCount: 300,
      },
      {
        name: "Kemeja Formal Premium",
        price: 299000,
        comparePrice: 450000,
        stock: 200,
        isFeatured: false,
        category: catMap["Fashion"],
        tags: ["kemeja", "formal"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&auto=format&fit=crop",
          },
        ],
        description: "Kemeja formal katun premium 100%, tidak mudah kusut.",
        shortDescription: "Kemeja formal katun premium",
        soldCount: 150,
      },
      {
        name: "Tas Ransel Anti-Air 30L",
        price: 399000,
        comparePrice: 580000,
        stock: 80,
        isFeatured: false,
        category: catMap["Fashion"],
        tags: ["tas", "ransel"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop",
          },
        ],
        description: "Tas ransel anti-air 30L, port USB charging, ergonomis.",
        shortDescription: "Tas ransel anti-air USB charging",
        soldCount: 90,
      },
      {
        name: "Blender Serbaguna 1000W",
        price: 449000,
        comparePrice: 650000,
        stock: 75,
        isFeatured: false,
        category: catMap["Rumah & Dapur"],
        tags: ["blender", "dapur"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&auto=format&fit=crop",
          },
        ],
        description:
          "Blender 1000W, hancurkan es batu, kapasitas 1.5L food-grade.",
        shortDescription: "Blender 1000W food-grade",
        soldCount: 60,
      },
      {
        name: "Serum Vitamin C 20%",
        price: 189000,
        comparePrice: 280000,
        stock: 150,
        isFeatured: true,
        category: catMap["Kecantikan"],
        tags: ["serum", "skincare"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop",
          },
        ],
        description: "Serum vitamin C 20%, cerahkan kulit, anti radikal bebas.",
        shortDescription: "Serum vitamin C pencerah kulit",
        soldCount: 400,
      },
    ];

    for (const p of products) {
      const slug =
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
      const sku =
        "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      await productsCol.insertOne({
        ...p,
        slug,
        sku,
        isActive: true,
        lowStockThreshold: 5,
        variants: [],
        ratings: { average: 0, count: 0 },
        viewCount: 0,
        createdBy: admin?._id,
        createdAt: now,
        updatedAt: now,
      });
      console.log("✅ Product:", p.name);
    }
  } else {
    console.log("ℹ️  Products exist:", prodCount);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed selesai!");
  console.log(`📧 Admin: ${ADMIN_EMAIL}`);
  console.log(`🔑 Pass:  ${ADMIN_PASSWORD}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
