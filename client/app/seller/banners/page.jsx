'use client';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import { categoryLabel } from '@/lib/labels';
import BannerSlide from '@/components/BannerSlide';

const categories = ['Earphone', 'Headphone', 'Watch', 'Smartphone', 'Laptop', 'Camera', 'Accessories'];
const inputClass = 'border border-gray-300 rounded px-3 py-2 w-full mt-1';

function BannerEditor({ banner, products, request, onSaved }) {
  const [draft, setDraft] = useState(banner);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fileKey, setFileKey] = useState(0);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  const save = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError('');
    try {
      const body = new FormData();
      body.append('data', JSON.stringify(draft));
      if (file) body.append('images', file);
      const result = await request(`/seller/banners/${banner.slot}`, { method: 'PUT', body });
      const saved = result.banners.find(item => item.slot === banner.slot);
      setDraft(saved); setFile(null); setFileKey(value => value + 1); onSaved(saved);
      toast.success('Đã lưu banner');
    } catch (error) { setError(error.message); }
    finally { setSaving(false); }
  };
  return <form onSubmit={save} className="border rounded-xl p-4 md:p-6 space-y-5">
    <fieldset disabled={saving} className="space-y-5 min-w-0">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-lg">Banner {banner.slot}</h2>
        <label className="flex items-center gap-2"><input type="checkbox" checked={draft.enabled} onChange={event => update('enabled', event.target.checked)} className="accent-orange-600" />Hiển thị trên trang chủ</label>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="md:col-span-2">Tiêu đề<textarea required maxLength={160} rows={2} value={draft.title} onChange={event => update('title', event.target.value)} className={inputClass} /></label>
        <label className="md:col-span-2">Dòng ưu đãi<input maxLength={120} value={draft.offer} onChange={event => update('offer', event.target.value)} className={inputClass} /><span className="text-xs text-gray-500">Nội dung quảng cáo này không tự thay đổi giá sản phẩm.</span></label>
        <label>Nút chính<input required maxLength={40} value={draft.buttonText1} onChange={event => update('buttonText1', event.target.value)} className={inputClass} /></label>
        <label>Nút phụ<input required maxLength={40} value={draft.buttonText2} onChange={event => update('buttonText2', event.target.value)} className={inputClass} /></label>
        <label>Hai nút dẫn đến<select value={draft.linkType} onChange={event => update('linkType', event.target.value)} className={inputClass}><option value="all">Tất cả sản phẩm</option><option value="category">Danh mục</option><option value="product">Một sản phẩm</option></select></label>
        {draft.linkType === 'category' && <label>Danh mục<select value={draft.category} onChange={event => update('category', event.target.value)} className={inputClass}>{categories.map(category => <option key={category} value={category}>{categoryLabel(category)}</option>)}</select></label>}
        {draft.linkType === 'product' && <label>Sản phẩm<select required value={draft.productId} onChange={event => update('productId', event.target.value)} className={inputClass}><option value="">Chọn sản phẩm</option>{draft.productId && !products.some(product => product._id === draft.productId) && <option value={draft.productId} disabled>Sản phẩm không còn bán — hãy chọn lại</option>}{products.map(product => <option key={product._id} value={product._id}>{product.name}</option>)}</select></label>}
        <label className="md:col-span-2">Thay ảnh<input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={event => {
          const selected = event.target.files[0];
          if (selected && (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > 5 * 1024 * 1024)) {
            setError('Chọn ảnh JPG, PNG hoặc WebP, tối đa 5 MB.'); event.target.value = ''; setFile(null); return;
          }
          setError(''); setFile(selected || null);
        }} /><span className="text-xs text-gray-500">JPG, PNG hoặc WebP, tối đa 5 MB. Không chọn ảnh mới thì giữ ảnh hiện tại.</span></label>
      </div>
      <div><p className="text-sm text-gray-500 mb-2">Xem trước{!draft.enabled && ' — banner đang được tắt'}</p><BannerSlide banner={{ ...draft, image: preview || draft.image }} preview /></div>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <div className="flex gap-4"><button type="submit" className="bg-orange-600 text-white rounded px-5 py-2 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu banner'}</button><button type="button" onClick={() => { setDraft(banner); setFile(null); setFileKey(value => value + 1); setError(''); }}>Hủy thay đổi</button></div>
    </fieldset>
  </form>;
}

export default function BannersPage() {
  const { request, products, productsError, fetchProductData } = useAppContext();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setBanners((await request('/seller/banners')).banners); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }, [request]);
  useEffect(() => { load(); }, [load]);
  return <div className="flex-1 min-w-0 p-4 md:p-10 space-y-6">
    <div><h1 className="text-2xl font-semibold">Quản lý banner</h1><p className="text-gray-500 mt-2">Chỉnh 3 banner trang chủ. Bấm Lưu banner để áp dụng; tắt cả 3 sẽ ẩn khu vực banner.</p></div>
    {loading && <p role="status">Đang tải banner...</p>}
    {error && <p role="alert" className="text-red-600">{error} <button onClick={load} className="underline">Thử lại</button></p>}
    {productsError && <p role="alert">Chưa tải được danh sách sản phẩm. <button onClick={fetchProductData} className="underline">Thử lại</button></p>}
    {!loading && !error && banners.map(banner => <BannerEditor key={banner.slot} banner={banner} products={products} request={request} onSaved={saved => setBanners(previous => previous.map(item => item.slot === saved.slot ? saved : item))} />)}
  </div>;
}
