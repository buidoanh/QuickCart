import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';
import Link from 'next/link';
export const metadata = { title: "Liên hệ | QuickCart", description: "Liên hệ QuickCart để được hỗ trợ về sản phẩm, đơn hàng và bán hàng." };
const faqs = [
  ["Tôi xem đơn hàng ở đâu?", "Đăng nhập và mở Đơn hàng của tôi để xem chi tiết đơn, trạng thái thanh toán và giao hàng."],
  ["Tôi thanh toán như thế nào?", "Hiện cửa hàng hỗ trợ thanh toán khi nhận hàng (COD). Tổng tiền được hiển thị bằng Việt Nam đồng trước khi đặt hàng."],
  ["Tôi nên cung cấp thông tin gì?", "Nếu cần hỗ trợ đơn hàng, hãy cung cấp mã đơn và mô tả vấn đề. Nếu hỏi về sản phẩm, hãy gửi tên hoặc đường dẫn sản phẩm."],
];
export default function Contact() {
  return <><Navbar /><main className="px-6 md:px-16 lg:px-32 max-w-[1600px] mx-auto">
    <div className="py-6 text-sm text-gray-500"><Link href="/" className="hover:text-orange-600">Trang chủ</Link><span className="mx-3">/</span>Liên hệ</div>
    <header className="bg-[#E6E9F2] rounded-3xl p-8 md:p-14"><p className="text-orange-600 text-sm font-medium uppercase tracking-widest">Sẵn sàng hỗ trợ</p><h1 className="text-4xl md:text-5xl font-medium text-gray-900 mt-5">Kết nối với chúng tôi.</h1><p className="mt-5 text-gray-600 leading-7 max-w-xl">Bạn cần hỗ trợ về sản phẩm, đơn hàng hoặc bán hàng trên QuickCart? Gửi tin nhắn để chúng tôi hỗ trợ bạn.</p></header>
    <Suspense fallback={<p className="py-14">Đang tải biểu mẫu liên hệ...</p>}><ContactSection /></Suspense>
    <section className="border-t border-gray-200 pt-14 pb-16"><h2 className="text-3xl font-medium text-gray-900">Những câu hỏi thường gặp.</h2><div className="mt-7">{faqs.map(([question,answer])=><details key={question} className="border-b border-gray-200 py-5"><summary className="cursor-pointer font-medium text-gray-800">{question}</summary><p className="mt-4 text-gray-600 leading-7 max-w-3xl">{answer}</p></details>)}</div></section>
  </main><Footer /></>;
}
