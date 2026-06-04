import mongoose, { Document, Schema, Model } from 'mongoose';

export type OrderStatus = 'pending_payment'|'paid'|'processing'|'shipped'|'delivered'|'cancelled'|'refunded';
export type PaymentMethod = 'bank_transfer'|'credit_card'|'e_wallet'|'cod';
export type PaymentStatus = 'unpaid'|'paid'|'refunded'|'failed';

export interface IOrderItem {
  product: mongoose.Types.ObjectId; name: string; image: string;
  price: number; quantity: number; variant?: string; subtotal: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string; customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: { name:string; phone:string; street:string; city:string; province:string; postalCode:string; country:string; };
  subtotal: number; shippingCost: number; discount: number; tax: number; total: number;
  status: OrderStatus; paymentMethod: PaymentMethod; paymentStatus: PaymentStatus;
  paymentProof?: string; paymentDate?: Date;
  adminNote?: string; customerNote?: string;
  trackingNumber?: string; estimatedDelivery?: Date;
  deliveredAt?: Date; cancelledAt?: Date; cancelReason?: string;
  createdAt: Date; updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String, image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: String,
  subtotal: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    shippingAddress: {
      name: String, phone: String, street: String,
      city: String, province: String, postalCode: String,
      country: { type: String, default: 'Indonesia' },
    },
    subtotal: Number, shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, tax: { type: Number, default: 0 },
    total: Number,
    status: { type: String, enum: ['pending_payment','paid','processing','shipped','delivered','cancelled','refunded'], default: 'pending_payment' },
    paymentMethod: { type: String, enum: ['bank_transfer','credit_card','e_wallet','cod'] },
    paymentStatus: { type: String, enum: ['unpaid','paid','refunded','failed'], default: 'unpaid' },
    paymentProof: String, paymentDate: Date,
    adminNote: String, customerNote: String,
    trackingNumber: String, estimatedDelivery: Date,
    deliveredAt: Date, cancelledAt: Date, cancelReason: String,
  },
  { timestamps: true }
);

OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth()+1).padStart(2,'0');
    const d = String(now.getDate()).padStart(2,'0');
    this.orderNumber = `ORD-${y}${m}${d}-${Math.random().toString(36).substring(2,7).toUpperCase()}`;
  }
  next();
});

// Satu set index saja, tidak duplikat
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
