'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import BannerSlide from './BannerSlide';

export default function HeaderSlider() {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchBanners = useCallback(async () => {
    setLoading(true); setError('');
    try { setBanners((await apiRequest('/banners')).banners); setCurrentSlide(0); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchBanners(); }, [fetchBanners]);
  useEffect(() => {
    if (banners.length < 2) return;
    const interval = setInterval(() => setCurrentSlide(previous => (previous + 1) % banners.length), 3000);
    return () => clearInterval(interval);
  }, [banners.length]);
  if (loading) return <div role="status" className="mt-6 h-80 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">Đang tải banner...</div>;
  if (error) return <div role="alert" className="mt-6 text-sm text-gray-500">Không tải được banner. <button onClick={fetchBanners} className="text-orange-600 underline">Thử lại</button></div>;
  if (!banners.length) return null;
  return <section aria-label="Ưu đãi nổi bật" className="overflow-hidden relative w-full mt-6">
    <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
      {banners.map((banner, index) => <div key={banner.slot} className="min-w-full" aria-hidden={index !== currentSlide} inert={index !== currentSlide ? true : undefined}><BannerSlide banner={banner} /></div>)}
    </div>
    {banners.length > 1 && <div className="flex justify-center gap-2 mt-8">
      {banners.map((banner, index) => <button key={banner.slot} type="button" aria-label={`Chuyển đến banner ${index + 1}`} aria-pressed={index === currentSlide} onClick={() => setCurrentSlide(index)} className={`h-3 w-3 rounded-full ${index === currentSlide ? 'bg-orange-600' : 'bg-gray-300'}`} />)}
    </div>}
  </section>;
}
