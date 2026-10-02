export const categoryLabels = { Earphone: 'Tai nghe nhét tai', Headphone: 'Tai nghe chụp tai', Watch: 'Đồng hồ', Smartphone: 'Điện thoại', Laptop: 'Máy tính xách tay', Camera: 'Máy ảnh', Accessories: 'Phụ kiện' };
export const topicLabels = { 'Order support': 'Hỗ trợ đơn hàng', 'Product question': 'Câu hỏi về sản phẩm', 'Seller enquiry': 'Hỗ trợ người bán', Other: 'Khác' };
export const statusLabels = { 'Order Placed': 'Đã đặt hàng', Processing: 'Đang xử lý', Shipped: 'Đang giao hàng', Delivered: 'Đã giao hàng', Cancelled: 'Đã hủy', 'Partially fulfilled': 'Đang giao một phần', Pending: 'Chưa thanh toán', Paid: 'Đã thanh toán' };
export const categoryLabel = value => categoryLabels[value] || value;
export const statusLabel = value => statusLabels[value] || value;
export function formatDate(value) { return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value)); }
