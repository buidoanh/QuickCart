import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiUrl } from '../lib/api-url.mjs';

test('API routing uses runtime bindings only on the server', () => {
  const oldBinding = process.env.QUICKCART_SERVER_URL;
  const oldPublic = process.env.NEXT_PUBLIC_API_URL;
  try {
    delete process.env.QUICKCART_SERVER_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    globalThis.window = {};
    assert.equal(apiUrl('/products?q=a%20b'), '/api/products?q=a%20b');
    process.env.QUICKCART_SERVER_URL = 'https://internal.example/service/server/';
    assert.equal(apiUrl('/cart'), '/api/cart');
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api/';
    assert.equal(apiUrl('/cart'), 'http://localhost:4000/api/cart');
    delete globalThis.window;
    assert.equal(apiUrl('/orders'), 'https://internal.example/service/server/api/orders');
    process.env.QUICKCART_SERVER_URL = 'https://preview.example/server';
    assert.equal(apiUrl('/products'), 'https://preview.example/server/api/products');
  } finally {
    delete globalThis.window;
    if (oldBinding === undefined) delete process.env.QUICKCART_SERVER_URL;
    else process.env.QUICKCART_SERVER_URL = oldBinding;
    if (oldPublic === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = oldPublic;
  }
});
