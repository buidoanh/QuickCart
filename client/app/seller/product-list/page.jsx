'use client'
import { categoryLabel } from '@/lib/labels';
import React, { useEffect, useState, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const ProductList = () => {

  const { formatCurrency, router, request, fetchProductData } = useAppContext()

  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSellerProduct = useCallback(async () => {
    setLoading(true); setError('');
    try { setProducts((await request('/seller/products')).products); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }, [request]);
  useEffect(() => { fetchSellerProduct(); }, [fetchSellerProduct]);
  const removeProduct = async id => {
    if (!window.confirm("Bạn muốn xóa sản phẩm này khỏi cửa hàng?")) return;
    try { await request(`/seller/products/${id}`, { method: 'DELETE' }); await fetchSellerProduct(); await fetchProductData(); }
    catch (error) { setError(error.message); }
  };
  const saveProduct = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      await request(`/seller/products/${editing._id}`, { method: 'PATCH', body: editing });
      setEditing(null); await fetchSellerProduct(); await fetchProductData();
    } catch (error) { setError(error.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">Danh sách sản phẩm</h2>
        {error && <p role="alert" className="text-red-600">{error} <button onClick={fetchSellerProduct}>Thử lại</button></p>}
        {!error && !products.length && <p>Chưa có sản phẩm. Hãy thêm sản phẩm đầu tiên.</p>}
        {editing && <form onSubmit={saveProduct} className="border p-5 mb-6 grid gap-3 max-w-lg">
          <h3>Chỉnh sửa sản phẩm</h3>
          {['name', 'description', 'price', 'offerPrice'].map(key => <label key={key}>{key === "price" ? "Giá gốc (VND)" : key === "offerPrice" ? "Giá bán (VND)" : ({ name: "Tên sản phẩm", description: "Mô tả" }[key] || key)}<input className="border p-2 w-full" required type={key.includes('rice') ? 'number' : 'text'} min="0" step="1" value={editing[key]} onChange={e => setEditing({ ...editing, [key]: e.target.value })} /></label>)}
          <label>Danh mục<select className="border p-2 w-full" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}>{['Earphone','Headphone','Watch','Smartphone','Laptop','Camera','Accessories'].map(category => <option key={category} value={category}>{categoryLabel(category)}</option>)}</select></label>
          <div className="flex gap-4"><button disabled={saving} className="bg-orange-600 text-white px-4 py-2">Lưu</button><button type="button" onClick={() => setEditing(null)}>Hủy</button></div>
        </form>}
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className=" table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Sản phẩm</th>
                <th className="px-4 py-3 font-medium truncate max-sm:hidden">Danh mục</th>
                <th className="px-4 py-3 font-medium truncate">
                  Giá
                </th>
                <th className="px-4 py-3 font-medium truncate ">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product, index) => (
                <tr key={index} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="bg-gray-500/10 rounded p-2">
                      <Image
                        src={product.image[0]}
                        alt=""
                        className="w-16"
                        width={1280}
                        height={720}
                      />
                    </div>
                    <span className="truncate w-full">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">{categoryLabel(product.category)}</td>
                  <td className="px-4 py-3">{formatCurrency(product.offerPrice)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => router.push(`/product/${product._id}`)} className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md">
                      <span className="hidden md:block">Xem</span>
                      <Image
                        className="h-3.5"
                        src={assets.redirect_icon}
                        alt=""
                      />
                    </button>
                    <button className="text-orange-600 mr-3 mt-2" onClick={() => setEditing({ ...product })}>Sửa</button>
                    <button className="text-red-600" onClick={() => removeProduct(product._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}
      <Footer />
    </div>
  );
};

export default ProductList;