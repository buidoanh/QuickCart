import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Banner, Product } from '../src/models.js';
import { defaultBanners } from '../src/banners.js';

let database;
let app;
let uploads = 0;
const auth = {
  middleware: (req, res, next) => next(),
  requireUser(req, res, next) {
    if (!req.headers['x-role']) return res.sendStatus(401);
    req.userId = 'test-seller'; next();
  },
  requireSeller(req, res, next) {
    if (req.headers['x-role'] !== 'seller') return res.sendStatus(403);
    next();
  },
};
before(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
  await Banner.init();
  app = createApp({ origins: [] }, { auth, uploadImages: async () => {
    uploads++;
    return [{ secure_url: 'https://res.cloudinary.com/test/image/upload/banner.png', public_id: 'test-banner' }];
  } });
});
after(async () => { await mongoose.disconnect(); await database?.stop(); });
const save = (slot, data) => request(app).put(`/api/seller/banners/${slot}`).set('x-role', 'seller').field('data', JSON.stringify(data));

test('public defaults are readable without authentication; editing requires seller', async () => {
  const response = await request(app).get('/api/banners').expect(200);
  assert.equal(response.body.banners.length, 3);
  assert.equal(response.body.banners[2].href, '/all-products?category=Laptop');
  await request(app).get('/api/seller/banners').expect(401);
  await request(app).get('/api/seller/banners').set('x-role', 'customer').expect(403);
  await request(app).put('/api/seller/banners/1').field('data', JSON.stringify(defaultBanners[0])).expect(401);
  await request(app).put('/api/seller/banners/1').set('x-role', 'customer').field('data', JSON.stringify(defaultBanners[0])).expect(403);
});

test('saves text and product links persistently while preserving the current image', async () => {
  const product = await Product.create({ userId: 'test-seller', name: 'Laptop test', active: true });
  const data = { ...defaultBanners[0], title: 'Banner mới', linkType: 'product', productId: String(product._id) };
  await save(1, data).expect(200);
  const persisted = await Banner.findOne({ slot: 1 }).lean();
  assert.equal(persisted.title, data.title);
  assert.equal(persisted.image, defaultBanners[0].image);
  const response = await request(app).get('/api/banners').expect(200);
  assert.equal(response.body.banners[0].href, `/product/${product._id}`);
});

test('uploads a replacement image, and subsequent text edits keep it', async () => {
  await save(2, defaultBanners[1]).attach('images', Buffer.from('mock image'), { filename: 'banner.png', contentType: 'image/png' }).expect(200);
  await save(2, { ...defaultBanners[1], title: 'Đã sửa chữ', image: 'javascript:alert(1)' }).expect(200);
  assert.equal(uploads, 1);
  assert.equal((await Banner.findOne({ slot: 2 })).image, 'https://res.cloudinary.com/test/image/upload/banner.png');
});

test('rejects invalid slots, links, nonexistent products, and multiple images', async () => {
  await save(4, defaultBanners[0]).expect(400);
  await save(1, { ...defaultBanners[0], title: ' ' }).expect(400);
  await save(1, { ...defaultBanners[0], linkType: 'javascript:alert(1)' }).expect(400);
  await save(1, { ...defaultBanners[0], linkType: 'product', productId: '000000000000000000000000' }).expect(400);
  await save(1, defaultBanners[0])
    .attach('images', Buffer.from('mock'), { filename: 'a.png', contentType: 'image/png' })
    .attach('images', Buffer.from('mock'), { filename: 'b.png', contentType: 'image/png' }).expect(400);
  assert.equal(uploads, 1);
});

test('disabled banners stay editable and disabling all does not restore defaults', async () => {
  for (const banner of defaultBanners) await save(banner.slot, { ...banner, enabled: false }).expect(200);
  assert.deepEqual((await request(app).get('/api/banners').expect(200)).body.banners, []);
  const response = await request(app).get('/api/seller/banners').set('x-role', 'seller').expect(200);
  assert.equal(response.body.banners.length, 3);
  assert.ok(response.body.banners.every(banner => !banner.enabled));
  await save(3, { ...defaultBanners[2], enabled: true, linkType: 'all' }).expect(200);
  const visible = (await request(app).get('/api/banners').expect(200)).body.banners;
  assert.equal(visible.length, 1);
  assert.equal(visible[0].href, '/all-products');
});
