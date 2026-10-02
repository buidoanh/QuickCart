import express from 'express';
import { readConfig } from './config.js';
import { connectDatabase } from './database.js';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { Product, Cart, Address, Order, Subscriber, ContactMessage } from './models.js';
import { contactMailConfigured, sendContactNotification } from './mail.js';
import { clerkAuth } from './auth.js';
import { upload, uploadImages, cleanupImages } from './upload.js';
import { objectId, productInput, addressInput, cartInput, checkoutInput, quoteInput, newsletterInput, contactInput, statusInput, calculateTotals, fail } from './validation.js';

let vercelApp;

// Vercel invokes this entrypoint without starting a local HTTP listener.
export default async function handler(req, res) {
  try {
    const config = readConfig();
    await connectDatabase(config.mongoUri);
    vercelApp ||= createApp(config);
  } catch (error) {
    console.error(`Backend startup failed (${error.code || error.name})`);
    return res.status(503).json({ success: false, message: 'Service temporarily unavailable' });
  }
  return vercelApp(req, res);
}

// Dependencies can be replaced only by the in-process test harness, never by HTTP input.
export function createApp(config, dependencies = {}) {
  const auth = dependencies.auth || clerkAuth(config);
  const images = dependencies.uploadImages || uploadImages;
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin(origin, callback) { callback(null, !origin || config.origins.includes(origin)); } }));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', rateLimit({ windowMs: 60000, limit: 200, message: { success: false, message: 'Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau.' }, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ success: mongoose.connection.readyState === 1, service: 'quickcart-api' }));
  app.get('/api/products', async (req, res) => {
    const products = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, currency: 'VND', products });
  });
  app.get('/api/products/:id', async (req, res) => {
    const product = await Product.findOne({ _id: objectId.parse(req.params.id), active: true }).lean();
    if (!product) fail(404, "Không tìm thấy sản phẩm");
    res.json({ success: true, currency: 'VND', product });
  });
  app.post('/api/contact', rateLimit({ windowMs: 3600000, limit: 5, message: { success: false, message: "Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau." } }), async (req, res) => {
    const data = contactInput.parse(req.body);
    const { requestId, ...details } = data;
    const message = await ContactMessage.findOneAndUpdate({ requestId }, { $setOnInsert: details }, { upsert: true, returnDocument: 'after', runValidators: true });
    let delivery = message.emailStatus === 'Sent' ? 'sent' : 'stored';
    if (delivery !== 'sent' && (dependencies.notifyContact || contactMailConfigured())) {
      const claimed = await ContactMessage.findOneAndUpdate({
        _id: message._id,
        $or: [{ emailStatus: { $in: ['Pending', 'Failed'] } }, { emailStatus: { $exists: false } }, { emailStatus: 'Sending', emailAttemptedAt: { $lt: new Date(Date.now() - 60000) } }],
      }, { $set: { emailStatus: 'Sending', emailAttemptedAt: new Date() } }, { returnDocument: 'after' });
      if (claimed) {
        try {
          await (dependencies.notifyContact || sendContactNotification)(claimed);
          await ContactMessage.updateOne({ _id: message._id }, { $set: { emailStatus: 'Sent' } });
          delivery = 'sent';
        } catch {
          await ContactMessage.updateOne({ _id: message._id }, { $set: { emailStatus: 'Failed' } });
          return res.status(502).json({ success: false, message: "Tin nhắn đã được lưu nhưng chưa gửi được email. Vui lòng thử gửi lại." });
        }
      } else delivery = 'pending';
    }
    res.status(201).json({ success: true, reference: String(message._id), delivery });
  });
  app.post('/api/newsletter', rateLimit({ windowMs: 3600000, limit: 10, message: { success: false, message: 'Bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau.' } }), async (req, res) => {
    const { email } = newsletterInput.parse(req.body);
    await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
    res.json({ success: true, message: "Đăng ký thành công! Dùng WELCOME20 để giảm 20% khi đặt hàng bằng email này." });
  });

  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, auth.middleware, auth.requireUser);
  app.get('/api/me', async (req, res) => res.json({ success: true, user: await auth.profile(req) }));
  app.get('/api/cart', async (req, res) => {
    const cart = await Cart.findOne({ userId: req.userId }).lean();
    res.json({ success: true, cartItems: cart?.items || {} });
  });
  app.put('/api/cart', async (req, res) => {
    const { productId, quantity } = cartInput.parse(req.body);
    if (quantity && !await Product.exists({ _id: productId, active: true })) fail(404, "Sản phẩm không còn bán");
    const update = quantity ? { $set: { [`items.${productId}`]: quantity } } : { $unset: { [`items.${productId}`]: '' } };
    const cart = await Cart.findOneAndUpdate({ userId: req.userId }, update, { upsert: true, returnDocument: 'after' }).lean();
    res.json({ success: true, cartItems: cart.items || {} });
  });
  app.get('/api/addresses', async (req, res) => res.json({ success: true, addresses: await Address.find({ userId: req.userId }).sort({ createdAt: -1 }).lean() }));
  app.post('/api/addresses', async (req, res) => {
    const address = await Address.create({ ...addressInput.parse(req.body), userId: req.userId });
    res.status(201).json({ success: true, address });
  });
  app.delete('/api/addresses/:id', async (req, res) => {
    const result = await Address.deleteOne({ _id: objectId.parse(req.params.id), userId: req.userId });
    if (!result.deletedCount) fail(404, "Không tìm thấy địa chỉ");
    res.json({ success: true });
  });

  async function discountFor(req, code) {
    if (!code) return 0;
    if (code.toUpperCase() !== 'WELCOME20') fail(400, "Mã giảm giá không hợp lệ");
    const profile = await auth.profile(req);
    if (!profile.email || !await Subscriber.exists({ email: profile.email.toLowerCase() })) fail(400, "Đăng ký nhận tin bằng email tài khoản để dùng WELCOME20");
    return 0.2;
  }
  async function cartProducts(userId, session = null) {
    const cart = await Cart.findOne({ userId }).session(session).lean();
    const entries = Object.entries(cart?.items || {}).filter(([, quantity]) => quantity > 0);
    if (!entries.length) fail(400, "Giỏ hàng đang trống");
    const products = await Product.find({ _id: { $in: entries.map(([id]) => id) }, active: true }).session(session).lean();
    return entries.map(([id, quantity]) => {
      const product = products.find(p => String(p._id) === id);
      if (!product) fail(409, "Có sản phẩm không còn bán. Vui lòng xóa khỏi giỏ hàng.");
      return { product, quantity, sellerId: product.userId };
    });
  }
  app.post('/api/orders/quote', async (req, res) => {
    const { promoCode } = quoteInput.parse(req.body);
    const rate = await discountFor(req, promoCode);
    res.json({ success: true, ...calculateTotals(await cartProducts(req.userId), rate) });
  });
  app.post('/api/orders', async (req, res) => {
    const { addressId, requestId, promoCode } = checkoutInput.parse(req.body);
    const previous = await Order.findOne({ userId: req.userId, requestId });
    if (previous) return res.json({ success: true, order: previous });
    const rate = await discountFor(req, promoCode);
    let order;
    try {
      await mongoose.connection.transaction(async session => {
        const duplicate = await Order.findOne({ userId: req.userId, requestId }).session(session);
        if (duplicate) { order = duplicate; return; }
        const address = await Address.findOne({ _id: addressId, userId: req.userId }).session(session).lean();
        if (!address) fail(404, "Không tìm thấy địa chỉ");
        const items = await cartProducts(req.userId, session);
        [order] = await Order.create([{ userId: req.userId, requestId, address, items, ...calculateTotals(items, rate), sellerStatuses: Object.fromEntries(items.map(i => [i.sellerId, 'Order Placed'])) }], { session });
        await Cart.updateOne({ userId: req.userId }, { $set: { items: {} } }, { session });
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      order = await Order.findOne({ userId: req.userId, requestId });
      if (!order) throw error;
    }
    res.status(201).json({ success: true, order });
  });
  app.get('/api/orders', async (req, res) => res.json({ success: true, orders: await Order.find({ userId: req.userId }).sort({ date: -1 }).lean() }));

  app.use('/api/seller', auth.requireSeller);
  app.get('/api/seller/products', async (req, res) => res.json({ success: true, products: await Product.find({ userId: req.userId, active: true }).sort({ createdAt: -1 }).lean() }));
  app.post('/api/seller/products', upload, async (req, res) => {
    const data = productInput.parse(req.body);
    const uploaded = await images(req.files);
    try {
      const product = await Product.create({ ...data, userId: req.userId, image: uploaded.map(i => i.secure_url) });
      res.status(201).json({ success: true, product });
    } catch (error) { await cleanupImages(uploaded); throw error; }
  });
  app.patch('/api/seller/products/:id', async (req, res) => {
    const product = await Product.findOneAndUpdate({ _id: objectId.parse(req.params.id), userId: req.userId, active: true }, { $set: productInput.parse(req.body) }, { returnDocument: 'after' });
    if (!product) fail(404, "Không tìm thấy sản phẩm");
    res.json({ success: true, product });
  });
  app.delete('/api/seller/products/:id', async (req, res) => {
    const result = await Product.updateOne({ _id: objectId.parse(req.params.id), userId: req.userId, active: true }, { $set: { active: false } });
    if (!result.matchedCount) fail(404, "Không tìm thấy sản phẩm");
    res.json({ success: true });
  });
  app.get('/api/seller/orders', async (req, res) => {
    const orders = await Order.find({ 'items.sellerId': req.userId }).sort({ date: -1 }).lean();
    res.json({ success: true, orders: orders.map(order => {
      const items = order.items.filter(item => item.sellerId === req.userId);
      const totals = calculateTotals(items, order.subtotal ? order.discount / order.subtotal : 0);
      return { _id: order._id, items, address: order.address, date: order.date, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, status: order.sellerStatuses?.[req.userId] || 'Order Placed', ...totals };
    }) });
  });
  app.patch('/api/seller/orders/:id', async (req, res) => {
    const id = objectId.parse(req.params.id);
    const { status } = statusInput.parse(req.body);
    await mongoose.connection.transaction(async session => {
      const order = await Order.findOne({ _id: id, 'items.sellerId': req.userId }).session(session);
      if (!order) fail(404, "Không tìm thấy đơn hàng");
      const current = order.sellerStatuses.get(req.userId) || 'Order Placed';
      const allowed = { 'Order Placed': ['Processing', 'Cancelled'], Processing: ['Shipped', 'Cancelled'], Shipped: ['Delivered'], Delivered: [], Cancelled: [] };
      if (status !== current && !allowed[current]?.includes(status)) fail(409, "Không thể chuyển sang trạng thái đơn hàng này");
      order.sellerStatuses.set(req.userId, status);
      const statuses = [...order.sellerStatuses.values()];
      order.status = statuses.every(s => s === status) ? status : 'Partially fulfilled';
      if (statuses.every(s => s === 'Delivered')) order.paymentStatus = 'Paid';
      await order.save({ session });
    });
    res.json({ success: true });
  });
  app.use((req, res) => res.status(404).json({ success: false, message: "Không tìm thấy đường dẫn" }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof ZodError) return res.status(400).json({ success: false, message: error.issues.map(i => `${({name:'Tên', email:'Email', subject:'Chủ đề', message:'Nội dung', requestId:'Mã yêu cầu', price:'Giá gốc', offerPrice:'Giá bán', category:'Danh mục', description:'Mô tả', quantity:'Số lượng', productId:'Mã sản phẩm', addressId:'Mã địa chỉ', fullName:'Họ và tên', phoneNumber:'Số điện thoại', pincode:'Mã bưu chính', area:'Địa chỉ', city:'Quận/huyện', state:'Tỉnh/thành phố', promoCode:'Mã giảm giá'}[i.path[0]] || 'Thông tin')}: ${i.message}`).join('; ') });
    if (error.name === 'MulterError') return res.status(400).json({ success: false, message: "Chỉ được tải tối đa 4 ảnh, mỗi ảnh không quá 5 MB" });
    const status = error.code === 11000 ? 409 : (error.status || 500);
    if (status >= 500) console.error(`API error: ${error.name} (${error.code || status})`);
    res.status(status).json({ success: false, message: status < 500 && error.status ? error.message : status === 409 ? "Yêu cầu bị trùng. Vui lòng thử lại" : "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau" });
  });
  return app;
}
