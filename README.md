# QuickCart

## Deploy một project với Vercel Services

Import repository với **Root Directory là thư mục gốc** (để trống hoặc `.`), không chọn `client` hay `server`. File `vercel.json` ở gốc định nghĩa:

- `client`: Next.js, phục vụ `/` và các đường dẫn ngoài `/api/`.
- `server`: Express, entrypoint `src/app.js`, public tại `/api/*`. Vercel giữ nguyên tiền tố `/api`, khớp các route hiện có. Các API tài khoản vẫn yêu cầu Clerk token.
- Binding `client → server`: Vercel tự cấp `QUICKCART_SERVER_URL`. Không tự đặt biến này, không thêm tiền tố `NEXT_PUBLIC_`.

Hiện các request trong AppContext chạy ở trình duyệt, dùng `/api` cùng domain. Helper API cũng hỗ trợ gọi từ Next.js function lúc runtime qua binding; hiện chưa có luồng gọi API phía server. Không gọi helper đó trong middleware hoặc khi prerender/build, vì binding chỉ có ở runtime.

Trong **Vercel Project → Settings → Environment Variables**, cấu hình cho các môi trường cần deploy:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `/api` (thay giá trị domain backend cũ nếu có) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_...` của ứng dụng Clerk |
| `CLERK_PUBLISHABLE_KEY` | Cùng public key Clerk phía trên |
| `CLERK_SECRET_KEY` | `sk_...` của cùng ứng dụng Clerk |
| `MONGODB_URI` | URI MongoDB Atlas hoặc replica set |
| `CLIENT_ORIGIN` | `https://<domain-project>`; nhiều origin phân cách bằng dấu phẩy |
| `CLOUDINARY_CLOUD_NAME` | Cloud name để upload sản phẩm |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |

Các biến SMTP cho form liên hệ được mô tả cuối tài liệu. Thiết lập domain ứng dụng trong Clerk theo môi trường tương ứng. Các giá trị trong bảng là placeholder; không commit secret.

Kiểm tra nhiều service ở thư mục gốc bằng `vercel dev` hoặc `vercel dev --local` (không cần đăng nhập). Khi chạy kiểu này, đặt `NEXT_PUBLIC_API_URL=/api` trong `client/.env` thay cho URL localhost; Vercel tự inject binding. Khi chạy hai terminal bằng `npm run dev` như bên dưới, giữ `NEXT_PUBLIC_API_URL=http://localhost:4000/api`.

Kiểm tra routing bằng `node --test client/tests/api-url.test.mjs`, lint/build bằng các lệnh bên dưới. Sau deploy kiểm tra `/`, `/api/health`, `/api/products`, đăng nhập, giỏ hàng và upload. Build thành công không thay thế kiểm tra database, Clerk và Cloudinary trên deployment thật.

Tài liệu: [Vercel Services](https://vercel.com/docs/services), [routing](https://vercel.com/docs/services/routing), [bindings](https://vercel.com/docs/services/bindings).

Ứng dụng bán hàng tách riêng **client (Next.js)** và **server (Express + MongoDB)**, mỗi bên là một project độc lập, có dependency và lockfile riêng.

## Cấu trúc

```text
QuickCart/
├── client/                  # Frontend độc lập
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── assets/
│   ├── public/
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   └── .env
├── server/                  # Backend độc lập
│   ├── src/
│   ├── tests/
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   └── .env
└── README.md
```

## Cài đặt

Yêu cầu Node.js >= 22.12, MongoDB Atlas hoặc MongoDB replica set (để tạo đơn và xóa giỏ trong cùng transaction), tài khoản Clerk. Cloudinary dùng cho upload sản phẩm.

```powershell
npm install --prefix client
npm install --prefix server
```

Hai ứng dụng đọc file môi trường riêng. Điền trực tiếp `client/.env` và `server/.env` theo các biến bên dưới.

`client/.env`:

```dotenv
NEXT_PUBLIC_CURRENCY=VND
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_<your_key>
CLERK_SECRET_KEY=sk_test_<your_key>
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

`server/.env`:

```dotenv
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/quickcart
CLERK_PUBLISHABLE_KEY=pk_test_<same_key_as_client>
CLERK_SECRET_KEY=sk_test_<your_key>
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

Clerk public/secret key phải thuộc cùng ứng dụng. Trong `client/.env`, `CLERK_SECRET_KEY` dành riêng cho middleware chạy phía server của Next.js; không có tiền tố `NEXT_PUBLIC_` và không được đưa vào mã trình duyệt. MongoDB và Cloudinary chỉ nằm trong `server/.env`. Inngest chưa được dùng; tạo đơn hiện thực hiện trực tiếp bằng transaction.

## Lệnh chạy

Mở hai terminal riêng.

Frontend:
```powershell
cd D:\QuickCart\client
npm install --cache D:\npm-cache
npm run dev
```

Backend:
```powershell
cd D:\QuickCart\server
npm install --cache D:\npm-cache
npm run dev
```

Nếu đã cài dependency thì chỉ cần `npm run dev`. Trên máy khác, dùng đường dẫn project thực tế và có thể bỏ tùy chọn `--cache`.

Chạy `npm run lint`, `npm run build` trong `client/`; chạy `npm test` trong `server/`. Khi chạy production, `npm start` riêng trong mỗi thư mục (frontend cần build trước).

Mỗi project có `package.json`, `package-lock.json`, `node_modules` và `.env` riêng; không dùng npm workspaces hoặc dependency ở thư mục gốc. Có thể copy riêng `client/` hoặc `server/`, cài dependency và chạy mà không cần project bên kia để khởi động. Frontend vẫn cần URL backend hợp lệ cho chức năng mua hàng.

API health: `http://localhost:4000/api/health`. Backend chỉ mở cổng sau khi kết nối DB và kiểm tra hỗ trợ transaction. Thiếu Clerk key thì client hiển thị hướng dẫn cấu hình. Sau khi sửa biến môi trường, khởi động lại dev server; với production cần build lại frontend.

## Tài khoản và seller

- Đăng ký/đăng nhập bằng nút **Sign in** của Clerk.
- Trong Clerk Dashboard, chọn user và đặt **public metadata** thành `{ "role": "seller" }` để cấp quyền seller. Tải lại trang sau khi đổi quyền.
- Backend kiểm tra metadata qua Clerk Backend API; gửi `role` hoặc `userId` giả từ frontend không cấp quyền.
- Seller Dashboard hỗ trợ thêm sản phẩm với 1–4 ảnh JPEG/PNG/WebP (tối đa 5 MB/ảnh), sửa thông tin/giá, ẩn sản phẩm và cập nhật đơn thuộc seller đó.
- Database mới chưa có sản phẩm. Dùng tài khoản seller để thêm; frontend không tự chèn dữ liệu mẫu.

## Luồng mua hàng

1. Xem sản phẩm công khai, đăng nhập để thêm vào giỏ. Giỏ lưu theo Clerk user ID trong MongoDB.
2. Lưu và chọn địa chỉ giao hàng.
3. Đăng ký newsletter bằng email chính của tài khoản để dùng `WELCOME20` giảm 20%. Mã hiện dùng lại được, chưa giới hạn một lần.
4. Backend đọc giá từ DB, tính giảm giá và thuế 2% bằng đơn vị đồng, làm tròn đến 1 VND. Miễn phí vận chuyển theo giao diện hiện tại.
5. Đặt hàng **COD**, lưu bản chụp sản phẩm/địa chỉ và xóa giỏ trong một transaction. Request UUID chống tạo trùng khi retry cùng yêu cầu.
6. Theo dõi tại **My orders**. Seller chuyển `Order Placed → Processing → Shipped → Delivered`; có thể hủy trước khi giao vận. Đơn nhiều seller giữ trạng thái riêng; toàn bộ giao thành công thì COD chuyển sang Paid.

Chưa tích hợp thanh toán trực tuyến, tồn kho, email gửi ra hoặc dịch vụ vận chuyển. Newsletter chỉ lưu đăng ký, không tự gửi email. Paid là xác nhận COD từ seller, không phải xác nhận cổng thanh toán. Toàn bộ giá sử dụng VND, nhập số nguyên đồng và hiển thị theo định dạng Việt Nam (ví dụ 1.250.000 ₫). Số giá đã lưu không tự động quy đổi theo tỷ giá.

## API

Route riêng tư cần `Authorization: Bearer <Clerk session token>`.

| Method | Route | Chức năng |
|---|---|---|
| GET | `/api/health` | Kiểm tra DB |
| GET | `/api/products`, `/api/products/:id` | Sản phẩm công khai |
| POST | `/api/newsletter` | Lưu email đăng ký |
| GET | `/api/me` | Hồ sơ, quyền tài khoản |
| GET, PUT | `/api/cart` | Giỏ; PUT `{productId, quantity}` |
| GET, POST | `/api/addresses` | Địa chỉ của tài khoản |
| DELETE | `/api/addresses/:id` | Xóa địa chỉ của tài khoản |
| POST | `/api/orders/quote` | Tính tiền; `{promoCode}` |
| GET, POST | `/api/orders` | Lịch sử / đặt đơn; POST `{addressId, requestId, promoCode}` |
| GET, POST | `/api/seller/products` | Sản phẩm seller / thêm bằng multipart |
| PATCH, DELETE | `/api/seller/products/:id` | Sửa thông tin / ẩn sản phẩm của seller |
| GET | `/api/seller/orders` | Đơn có sản phẩm của seller |
| PATCH | `/api/seller/orders/:id` | Chuyển trạng thái; `{status}` |

PATCH sản phẩm nhận `name, description, category, price, saleEnabled` và `offerPrice` khi bật sale. POST multipart thêm các trường đó và 1–4 file `images`. Khi tắt sale, backend đặt giá tính tiền bằng `price`. Danh sách sản phẩm và đơn hiện chưa phân trang, phù hợp cửa hàng nhỏ.

## Quản lý banner trang chủ

Đăng nhập tài khoản người bán, mở **Quản lý banner** tại `/seller/banners`. Có 3 vị trí tương ứng 3 banner hiện tại, dùng chung cho toàn cửa hàng và được lưu trong MongoDB.

1. Sửa tiêu đề, dòng ưu đãi và tên hai nút.
2. Chọn đích đến của hai nút: tất cả sản phẩm, một danh mục hoặc một sản phẩm đang bán.
3. Chọn ảnh JPG/PNG/WebP tối đa 5 MB nếu muốn thay ảnh; bỏ trống để giữ ảnh hiện tại. Ảnh mới dùng cấu hình Cloudinary của backend.
4. Kiểm tra phần xem trước, bật/tắt **Hiển thị trên trang chủ**, rồi bấm **Lưu banner**. Tải lại trang chủ để xem thay đổi.

Tắt cả 3 banner sẽ ẩn khu vực này. Dòng ưu đãi là nội dung quảng cáo, không tự áp dụng giảm giá sản phẩm. Nội dung mặc định chỉ dùng cho vị trí chưa từng được lưu.

| Phương thức | API | Chức năng |
| --- | --- | --- |
| GET | `/api/banners` | Danh sách banner đang bật, không yêu cầu đăng nhập |
| GET | `/api/seller/banners` | Cả 3 banner, yêu cầu quyền người bán |
| PUT | `/api/seller/banners/:slot` | Lưu vị trí 1–3; multipart gồm trường `data` chứa JSON và tối đa 1 file `images` |

## Kiểm tra

Chạy `npm test` trong `server/`. Các bài kiểm tra hiện có bao gồm logic bật/tắt sale và API banner: phân quyền, lưu nội dung/liên kết, thay ảnh, validation và ẩn/hiện. API banner dùng MongoDB tạm của `mongodb-memory-server`, không ghi vào DB trong `.env`. Lần đầu cần mạng và dung lượng để tải binary MongoDB.

Clerk và Cloudinary dùng adapter giả lập trong bài kiểm tra. Cần kiểm tra đăng nhập và upload bằng dịch vụ thật sau khi điền khóa.

Tài liệu tích hợp: [Clerk Express](https://clerk.com/docs/reference/express/overview), [Clerk Next.js](https://clerk.com/docs/nextjs/getting-started/quickstart).

## Đóng góp và giấy phép

[LICENSE.md](LICENSE.md)

### Contact email delivery

The contact form saves messages in MongoDB and can notify the support inbox over SMTP. Configure these keys in server/.env, then restart the backend:

- SMTP_HOST: SMTP hostname (Gmail: smtp.gmail.com)
- SMTP_PORT: 465 for implicit TLS, or 587 for STARTTLS
- SMTP_USER: sending account email
- SMTP_PASS: SMTP credential (for Gmail, an app password)
- CONTACT_EMAIL: support inbox recipient
- SMTP_FROM: optional verified sending email; defaults to SMTP_USER

The customer email is used as Reply-To. Messages remain saved if delivery fails, and retrying the same request does not create a second message. Without complete SMTP configuration the form accepts and saves messages without claiming email delivery.
