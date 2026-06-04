import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  isActive: boolean;
  isEmailVerified: boolean;
  wishlist: mongoose.Types.ObjectId[];
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    addresses: { type: [], default: [] },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    refreshToken: { type: String, select: false, default: null },
  },
  { timestamps: true },
);

// Hapus pre-save hook - password di-hash manual di auth.utils.ts
UserSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// TIDAK ada schema.index() duplikat - unique:true di field sudah cukup
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
