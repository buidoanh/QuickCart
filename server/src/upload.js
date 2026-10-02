import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { fail } from './validation.js';
export const upload = multer({ storage: multer.memoryStorage(), limits: { files: 4, fileSize: 5 * 1024 * 1024, fields: 5, fieldSize: 10000 }, fileFilter(req, file, cb) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(Object.assign(new Error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP"), { status: 400 }));
  cb(null, true);
} }).array('images', 4);
export async function uploadImages(files) {
  if (!files?.length) fail(400, "Tải từ 1 đến 4 ảnh JPEG, PNG hoặc WebP (tối đa 5 MB mỗi ảnh)");
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) fail(503, "Chưa cấu hình tải ảnh");
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
  const uploaded = [];
  try {
    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'quickcart', resource_type: 'image', allowed_formats: ['jpg', 'png', 'webp'] }, (err, result) => err ? reject(err) : resolve(result)).end(file.buffer);
      });
      uploaded.push(result);
    }
    return uploaded;
  } catch {
    await cleanupImages(uploaded);
    fail(502, "Tải ảnh thất bại. Vui lòng thử lại");
  }
}
export async function cleanupImages(images) {
  await Promise.allSettled(images.map(image => cloudinary.uploader.destroy(image.public_id)));
}
