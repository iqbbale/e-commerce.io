import dotenv from "dotenv";
import path from "path";
// Load .env dari folder backend/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ecommerce.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce_db";

const run = async () => {
  console.log("\n🔧 RESET ADMIN SCRIPT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📡 Connecting:", MONGODB_URI);
  console.log(
    "🔑 JWT_SECRET:",
    process.env.JWT_SECRET ? "✅ loaded" : "❌ MISSING",
  );

  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB Connected\n");

  // Gunakan collection langsung - bypass SEMUA Mongoose middleware
  const db = mongoose.connection.db!;
  const users = db.collection("users");

  // Hapus semua user lama yang bermasalah
  const del = await users.deleteMany({});
  console.log(`🗑️  Deleted ${del.deletedCount} users\n`);

  // Hash password SEKALI
  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);

  // Insert admin langsung ke MongoDB (NO mongoose, NO hooks)
  const now = new Date();
  await users.insertOne({
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

  // Verifikasi password langsung
  const admin = await users.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    const valid = await bcrypt.compare(
      ADMIN_PASSWORD,
      admin.password as string,
    );
    console.log(`🔍 Password OK: ${valid ? "✅ YES" : "❌ NO"}`);
    console.log(`👤 Role: ${admin.role}`);
    console.log(`✅ isActive: ${admin.isActive}`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📧 Email   : ${ADMIN_EMAIL}`);
  console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n✅ Sekarang jalankan: pnpm dev\n");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
