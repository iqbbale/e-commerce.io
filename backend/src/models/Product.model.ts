import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  category: mongoose.Types.ObjectId;
  tags: string[];
  sku: string;
  stock: number;
  lowStockThreshold: number;
  variants: {
    name: string;
    value: string;
    stock: number;
    priceModifier: number;
  }[];
  weight?: number;
  isActive: boolean;
  isFeatured: boolean;
  ratings: { average: number; count: number };
  soldCount: number;
  viewCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    images: [{ url: String, alt: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [String],
    sku: { type: String, unique: true },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    variants: [
      { name: String, value: String, stock: Number, priceModifier: Number },
    ],
    weight: Number,
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Auto-generate slug & SKU
ProductSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug =
      this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
  }
  if (!this.sku) {
    this.sku =
      "SKU-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 7).toUpperCase();
  }
  next();
});

// Hanya 1 text index, tidak duplikat
ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ soldCount: -1 });

const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema,
);
export default Product;
