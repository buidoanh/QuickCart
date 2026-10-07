import { z } from 'zod';
z.config(z.locales.vi());
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Mã không hợp lệ");
const text = (max = 200) => z.string().trim().min(1).max(max);
const money = z.coerce.number().finite().int("Giá VND phải là số nguyên").min(0).max(1000000000000);
export const productInput = z.object({
  name: text(), description: text(5000), category: z.enum(['Earphone', 'Headphone', 'Watch', 'Smartphone', 'Laptop', 'Camera', 'Accessories']),
  price: money, offerPrice: money.optional(),
  saleEnabled: z.preprocess(value => value === 'true' ? true : value === 'false' ? false : value, z.boolean().default(false)),
}).refine(p => !p.saleEnabled || (p.offerPrice !== undefined && p.offerPrice < p.price), {
  message: "Giá sale phải thấp hơn giá bán thông thường", path: ['offerPrice'],
}).transform(p => ({ ...p, offerPrice: p.saleEnabled ? p.offerPrice : p.price }));
export const addressInput = z.object({ fullName: text(), phoneNumber: z.string().trim().regex(/^[+\d\s()-]{7,25}$/), pincode: text(20), area: text(500), city: text(), state: text() });
export const cartInput = z.object({ productId: objectId, quantity: z.number().int().min(0).max(99) });
export const checkoutInput = z.object({ addressId: objectId, requestId: z.string().uuid(), promoCode: z.string().trim().max(40).default('') });
export const quoteInput = z.object({ promoCode: z.string().trim().max(40).default('') });
export const newsletterInput = z.object({ email: z.email().max(254).transform(s => s.toLowerCase()) });
export const statusInput = z.object({ status: z.enum(['Processing', 'Shipped', 'Delivered', 'Cancelled']) });
export function fail(status, message) { throw Object.assign(new Error(message), { status }); }
export function calculateTotals(items, discountRate = 0) {
  if (!Number.isFinite(discountRate) || discountRate < 0 || discountRate > 1) fail(400, "Mức giảm giá không hợp lệ");
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.offerPrice;
    if (!Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(item.quantity) || item.quantity < 1) fail(400, "Giá và số lượng phải là số nguyên hợp lệ");
    return sum + price * item.quantity;
  }, 0);
  if (!Number.isSafeInteger(subtotal)) fail(400, "Tổng tiền đơn hàng quá lớn");
  const discount = Math.round(subtotal * discountRate);
  const tax = Math.round((subtotal - discount) * 0.02);
  const amount = subtotal - discount + tax;
  if (!Number.isSafeInteger(amount)) fail(400, "Tổng tiền đơn hàng quá lớn");
  return { currency: 'VND', subtotal, discount, tax, amount };
}

export const contactInput = z.object({
  requestId: z.string().uuid(), name: text(100),
  email: z.email().max(254).transform(value => value.toLowerCase()),
  subject: z.enum(['Order support', 'Product question', 'Seller enquiry', 'Other']),
  orderId: z.string().trim().max(100).default(''), message: z.string().trim().min(10).max(3000),
});
