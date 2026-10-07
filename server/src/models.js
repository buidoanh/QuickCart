import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const options = { timestamps: true };
export const Banner = model('Banner', new Schema({
  slot: { type: Number, required: true, unique: true, min: 1, max: 3 },
  title: String, offer: String, buttonText1: String, buttonText2: String,
  image: String, enabled: Boolean, linkType: String, category: String, productId: String,
}, options));
export const Product = model('Product', new Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true }, description: String,
  category: String, price: Number, offerPrice: Number,
  saleEnabled: Boolean,
  currency: { type: String, enum: ['VND'], default: 'VND', immutable: true },
  image: [String], active: { type: Boolean, default: true },
}, options));
export const Cart = model('Cart', new Schema({
  userId: { type: String, unique: true, required: true },
  items: { type: Map, of: Number, default: {} },
}, options));
export const Address = model('Address', new Schema({
  userId: { type: String, required: true, index: true },
  fullName: String, phoneNumber: String, pincode: String, area: String, city: String, state: String,
}, options));
const orderSchema = new Schema({
  userId: { type: String, required: true, index: true }, requestId: { type: String, required: true },
  address: { type: Schema.Types.Mixed, required: true },
  items: [{ product: Schema.Types.Mixed, quantity: Number, sellerId: String }],
  subtotal: Number, tax: Number, discount: Number, amount: Number,
  currency: { type: String, enum: ['VND'], default: 'VND', immutable: true },
  date: { type: Date, default: Date.now }, paymentMethod: { type: String, default: 'COD' },
  status: { type: String, default: 'Order Placed' }, sellerStatuses: { type: Map, of: String, default: {} },
  paymentStatus: { type: String, default: 'Pending' },
}, options);
orderSchema.index({ userId: 1, requestId: 1 }, { unique: true });
orderSchema.index({ 'items.sellerId': 1, date: -1 });
export const Order = model('Order', orderSchema);
export const Subscriber = model('Subscriber', new Schema({ email: { type: String, required: true, unique: true } }, options));

export const ContactMessage = model('ContactMessage', new Schema({
  requestId: { type: String, required: true, unique: true },
  name: { type: String, required: true }, email: { type: String, required: true },
  subject: { type: String, required: true }, orderId: { type: String, default: '' },
  emailStatus: { type: String, enum: ['Pending', 'Sending', 'Sent', 'Failed'], default: 'Pending' },
  emailAttemptedAt: Date,
  message: { type: String, required: true }, status: { type: String, enum: ['New', 'Resolved'], default: 'New' },
}, options));
