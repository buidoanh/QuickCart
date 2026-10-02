"use client";
import { useAppContext } from "@/context/AppContext";
export default function CatalogStatus() {
  const { products, productsLoading, productsError, fetchProductData } = useAppContext();
  if (productsLoading) return <p className="py-6">Đang tải sản phẩm...</p>;
  if (productsError) return <p role="alert" className="py-6 text-red-600">{productsError} <button onClick={fetchProductData}>Thử lại</button></p>;
  if (!products.length) return <p className="py-6">Chưa có sản phẩm nào.</p>;
  return null;
}
