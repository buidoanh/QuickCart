import { z } from 'zod';
import { Banner, Product } from './models.js';
import { upload, cleanupImages } from './upload.js';
import { fail, objectId } from './validation.js';

export const defaultBanners = [
  { slot: 1, title: 'Âm thanh sống động — tìm tai nghe phù hợp với bạn!', offer: 'Ưu đãi có thời hạn — giảm đến 30%', buttonText1: 'Mua ngay', buttonText2: 'Khám phá thêm', image: '/banners/header_headphone_image.png', category: 'Headphone' },
  { slot: 2, title: 'Khám phá thế giới game cùng PlayStation 5!', offer: 'Khám phá thiết bị chơi game ngay hôm nay', buttonText1: 'Mua sắm ngay', buttonText2: 'Khám phá ưu đãi', image: '/banners/header_playstation_image.png', category: 'Accessories' },
  { slot: 3, title: 'Hiệu năng và tinh tế — khám phá Apple MacBook Pro!', offer: 'Ưu đãi đặc biệt — giảm đến 40%', buttonText1: 'Đặt ngay', buttonText2: 'Tìm hiểu thêm', image: '/banners/header_macbook_image.png', category: 'Laptop' },
].map(banner => ({ ...banner, enabled: true, linkType: 'category', productId: '' }));

export const bannerInput = z.object({
  title: z.string().trim().min(1).max(160),
  offer: z.string().trim().max(120),
  buttonText1: z.string().trim().min(1).max(40),
  buttonText2: z.string().trim().min(1).max(40),
  enabled: z.boolean(),
  linkType: z.enum(['all', 'category', 'product']),
  category: z.enum(['Earphone', 'Headphone', 'Watch', 'Smartphone', 'Laptop', 'Camera', 'Accessories']),
  productId: z.union([objectId, z.literal('')]),
}).refine(data => data.linkType !== 'product' || data.productId, { path: ['productId'], message: 'Vui lòng chọn sản phẩm liên kết' });

export function bannerHref(banner) {
  if (banner.linkType === 'product') return `/product/${banner.productId}`;
  if (banner.linkType === 'category') return `/all-products?category=${banner.category}`;
  return '/all-products';
}

async function listBanners() {
  const saved = await Banner.find().lean();
  return defaultBanners.map(original => {
    const override = saved.find(banner => banner.slot === original.slot);
    const banner = { ...original, ...override };
    return { slot: banner.slot, title: banner.title, offer: banner.offer, buttonText1: banner.buttonText1, buttonText2: banner.buttonText2, image: banner.image, enabled: banner.enabled, linkType: banner.linkType, category: banner.category, productId: banner.productId, href: bannerHref(banner) };
  });
}

export function registerPublicBanners(app) {
  app.get('/api/banners', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, banners: (await listBanners()).filter(banner => banner.enabled) });
  });
}

export function registerSellerBanners(app, images) {
  app.get('/api/seller/banners', async (req, res) => res.json({ success: true, banners: await listBanners() }));
  app.put('/api/seller/banners/:slot', upload, async (req, res) => {
    const slot = z.coerce.number().int().min(1).max(3).parse(req.params.slot);
    let input;
    try { input = JSON.parse(req.body.data); } catch { fail(400, 'Nội dung banner không hợp lệ'); }
    const data = bannerInput.parse(input);
    if (req.files?.length > 1) fail(400, 'Chỉ chọn một ảnh cho mỗi banner');
    if (data.linkType === 'product' && !await Product.exists({ _id: data.productId, active: true })) fail(400, 'Sản phẩm liên kết không còn bán');
    const uploaded = req.files?.length ? await images(req.files) : [];
    try {
      await Banner.findOneAndUpdate({ slot }, {
        $set: { ...data, ...(uploaded.length ? { image: uploaded[0].secure_url } : {}) },
        $setOnInsert: { slot, ...(!uploaded.length ? { image: defaultBanners[slot - 1].image } : {}) },
      }, { upsert: true, runValidators: true });
    } catch (error) { if (uploaded.length) await cleanupImages(uploaded); throw error; }
    res.json({ success: true, banners: await listBanners() });
  });
}
