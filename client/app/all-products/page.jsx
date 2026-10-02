'use client';
import { categoryLabel } from '@/lib/labels';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CatalogStatus from '@/components/CatalogStatus';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
const categories = ['Earphone', 'Headphone', 'Watch', 'Smartphone', 'Laptop', 'Camera', 'Accessories'];
function Catalog() {
  const { products, productsLoading, productsError } = useAppContext();
  const params = useSearchParams();
  const requested = params.get('category');
  const category = categories.includes(requested) ? requested : '';
  const filtered = category ? products.filter(product => product.category === category) : products;
  return <>
    <Navbar />
    <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
      <div className="pt-12">
        <h1 className="text-2xl font-medium">{categoryLabel(category) || "Tất cả sản phẩm"}</h1>
        <div className="w-16 h-0.5 bg-orange-600 rounded-full" />
      </div>
      <nav aria-label="Danh mục sản phẩm" className="flex flex-wrap gap-3 mt-6">
        {['', ...categories].map(value => <Link key={value} href={value ? '/all-products?category=' + value : '/all-products'} aria-current={category === value ? 'page' : undefined} className={'border rounded-full px-4 py-2 text-sm ' + (category === value ? 'bg-orange-600 text-white border-orange-600' : 'hover:border-orange-600')}>{categoryLabel(value) || 'Tất cả'}</Link>)}
      </nav>
      <CatalogStatus />
      {!productsLoading && !productsError && products.length > 0 && filtered.length === 0 && <p className="py-6">Chưa có sản phẩm trong danh mục này. <Link href="/all-products" className="text-orange-600 underline">Xem tất cả sản phẩm</Link></p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-12 pb-14 w-full">
        {filtered.map(product => <ProductCard key={product._id} product={product} />)}
      </div>
    </div>
    <Footer />
  </>;
}
export default function AllProducts() {
  return <Suspense fallback={<p className="p-10">Đang tải sản phẩm...</p>}><Catalog /></Suspense>;
}
