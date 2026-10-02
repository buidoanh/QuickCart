'use client'
import { categoryLabel } from '@/lib/labels';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";

const AddProduct = () => {
  const { request, fetchProductData, router } = useAppContext();
  const [saving, setSaving] = useState(false);

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = files.map(file => file ? URL.createObjectURL(file) : null);
    setPreviews(urls);
    return () => urls.forEach(url => { if (url) URL.revokeObjectURL(url); });
  }, [files]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!files.filter(Boolean).length) return toast.error("Vui lòng chọn ít nhất một ảnh");
    setSaving(true);
    try {
      const body = new FormData();
      for (const [key, value] of Object.entries({ name, description, category, price, offerPrice })) body.append(key, value);
      files.filter(Boolean).forEach(file => body.append('images', file));
      await request('/seller/products', { method: 'POST', body });
      await fetchProductData(); toast.success("Đã thêm sản phẩm"); router.push('/seller/product-list');
    } catch (error) { toast.error(error.message); }
    finally { setSaving(false); }

  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Ảnh sản phẩm</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">

            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input onChange={(e) => {
                  const updatedFiles = [...files];
                  updatedFiles[index] = e.target.files[0];
                  setFiles(updatedFiles);
                }} accept="image/jpeg,image/png,image/webp" type="file" id={`image${index}`} hidden />
                <Image
                  key={index}
                  className="max-w-24 cursor-pointer"
                  src={previews[index] || assets.upload_area}
                  alt=""
                  width={100}
                  height={100}
                />
              </label>
            ))}

          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Tên sản phẩm
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Nhập nội dung"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Mô tả sản phẩm
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Nhập nội dung"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="category">
              Danh mục
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              defaultValue={category}
            >
              <option value="Earphone">{categoryLabel("Earphone")}</option>
              <option value="Headphone">{categoryLabel("Headphone")}</option>
              <option value="Watch">{categoryLabel("Watch")}</option>
              <option value="Smartphone">{categoryLabel("Smartphone")}</option>
              <option value="Laptop">{categoryLabel("Laptop")}</option>
              <option value="Camera">{categoryLabel("Camera")}</option>
              <option value="Accessories">{categoryLabel("Accessories")}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Giá gốc (VND)
            </label>
            <input
              id="product-price"
              type="number" min="0" step="1"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Giá bán (VND)
            </label>
            <input
              id="offer-price"
              type="number" min="0" step="1"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              required
            />
          </div>
        </div>
        <button disabled={saving} type="submit" className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded">
          {saving ? "Đang lưu..." : "Thêm sản phẩm"}
        </button>
      </form>
      {/* <Footer /> */}
    </div>
  );
};

export default AddProduct;