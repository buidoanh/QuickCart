import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export default function NotFound() {
  return <><Navbar /><main className="min-h-[60vh] px-6 py-20 flex flex-col items-center justify-center text-center"><p className="text-orange-600 text-lg">404</p><h1 className="text-3xl font-medium mt-4">Không tìm thấy trang</h1><p className="text-gray-500 mt-4">Trang bạn tìm có thể đã được chuyển hoặc không còn tồn tại.</p><Link href="/" className="bg-orange-600 text-white px-7 py-3 rounded-full mt-8">Về trang chủ</Link></main><Footer /></>;
}
