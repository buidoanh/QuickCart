import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { assets } from '@/assets/assets';
export const metadata = { title: "Về chúng tôi | QuickCart", description: "Khám phá QuickCart: mua sắm công nghệ dễ dàng, giá rõ ràng bằng VND." };
const values = [
  ['01', "Thông tin rõ ràng", "Xem thông tin sản phẩm, giá bằng VND và tổng tiền trước khi đặt hàng."],
  ['02', "Dễ mua sắm, nhiều lựa chọn", "Duyệt theo danh mục, lưu giỏ hàng và địa chỉ cho lần mua tiếp theo."],
  ['03', "Hỗ trợ theo nhu cầu", "Bạn có câu hỏi về sản phẩm hoặc đơn hàng? Gửi tin nhắn cho chúng tôi qua trang Liên hệ."],
];
export default function About() {
  return <><Navbar /><main className="px-6 md:px-16 lg:px-32 max-w-[1600px] mx-auto">
    <div className="py-6 text-sm text-gray-500"><Link href="/" className="hover:text-orange-600">Trang chủ</Link><span className="mx-3">/</span>Về chúng tôi</div>
    <section className="grid lg:grid-cols-2 rounded-3xl overflow-hidden bg-[#E6E9F2]">
      <div className="p-8 md:p-14 flex flex-col justify-center">
        <p className="text-orange-600 text-sm font-medium uppercase tracking-widest">Khám phá QuickCart</p>
        <h1 className="text-4xl md:text-5xl font-medium leading-tight mt-5 text-gray-900">Công nghệ phù hợp.<br />Mua sắm thật dễ dàng.</h1>
        <p className="mt-6 leading-7 text-gray-600 max-w-lg">QuickCart mang đến các sản phẩm công nghệ cho nhu cầu hằng ngày. Khám phá, so sánh và chọn sản phẩm phù hợp với bạn.</p>
        <Link href="/all-products" className="mt-8 self-start rounded-full bg-orange-600 hover:bg-orange-700 text-white px-7 py-3">Khám phá cửa hàng <span aria-hidden="true">&rarr;</span></Link>
      </div>
      <div className="relative min-h-[320px] lg:min-h-[480px]"><Image src={assets.boy_with_laptop_image} alt="Khám phá công nghệ cùng máy tính xách tay" fill priority className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" /></div>
    </section>
    <section className="grid md:grid-cols-2 gap-8 md:gap-20 py-16 md:py-24 border-b border-gray-200">
      <div><p className="text-orange-600 text-sm uppercase tracking-widest">Mục tiêu của chúng tôi</p><h2 className="mt-4 text-3xl md:text-4xl font-medium text-gray-900">Nâng cấp thiết bị<br />dễ dàng hơn mỗi ngày.</h2></div>
      <div className="space-y-5 text-gray-600 leading-7"><p>Chọn thiết bị bắt đầu từ nhu cầu của bạn. Sản phẩm được chia theo danh mục rõ ràng, từ tai nghe và máy ảnh đến máy tính xách tay và phụ kiện, giúp bạn dễ dàng tìm kiếm.</p><p>Mua sắm đơn giản với giá bằng Việt Nam đồng, địa chỉ nhận hàng được lưu sẵn, thanh toán khi nhận hàng và theo dõi trạng thái đơn trong tài khoản.</p></div>
    </section>
    <section className="py-16 md:py-20"><p className="text-orange-600 text-sm uppercase tracking-widest">Điều chúng tôi coi trọng</p><h2 className="mt-4 text-3xl font-medium text-gray-900">Đặt trải nghiệm mua sắm của bạn lên trước.</h2><div className="grid md:grid-cols-3 gap-6 mt-10">{values.map(([number,title,description]) => <article key={number} className="border border-gray-200 rounded-2xl p-7"><span className="text-orange-600 text-sm">{number}</span><h3 className="text-xl font-medium text-gray-900 mt-6">{title}</h3><p className="text-gray-600 leading-7 mt-3">{description}</p></article>)}</div></section>
    <section className="bg-gray-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16"><div><h2 className="text-3xl text-white font-medium">Bạn cần tư vấn trước khi mua?</h2><p className="text-gray-300 mt-3">Hãy chia sẻ nhu cầu của bạn với QuickCart.</p></div><Link href="/contact" className="bg-white text-gray-900 rounded-full px-7 py-3 shrink-0 hover:bg-orange-100">Liên hệ với chúng tôi &rarr;</Link></section>
  </main><Footer /></>;
}
