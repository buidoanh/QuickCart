import test from 'node:test';
import assert from 'node:assert/strict';
import { productInput } from '../src/validation.js';

const product = { name: 'Laptop', description: 'Laptop mới', category: 'Laptop', price: 10000000 };

test('new products default to regular pricing without a sale price', () => {
  const result = productInput.parse(product);
  assert.equal(result.saleEnabled, false);
  assert.equal(result.offerPrice, product.price);
});

test('disabling sale discards the previous discounted checkout price', () => {
  for (const saleEnabled of [false, 'false']) {
    const result = productInput.parse({ ...product, saleEnabled, offerPrice: 8000000 });
    assert.equal(result.saleEnabled, false);
    assert.equal(result.offerPrice, product.price);
  }
});

test('sale can be enabled through JSON or multipart form data', () => {
  for (const saleEnabled of [true, 'true']) {
    const result = productInput.parse({ ...product, saleEnabled, offerPrice: '8000000' });
    assert.equal(result.saleEnabled, true);
    assert.equal(result.offerPrice, 8000000);
  }
});

test('sale requires a valid price strictly below the regular price', () => {
  for (const offerPrice of [undefined, 10000000, 11000000, -1]) {
    assert.equal(productInput.safeParse({ ...product, saleEnabled: true, offerPrice }).success, false);
  }
  assert.equal(productInput.parse({ ...product, saleEnabled: true, offerPrice: 0 }).offerPrice, 0);
});
