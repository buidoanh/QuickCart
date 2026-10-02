"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import toast from "react-hot-toast";
export default function NewsLetter() {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const subscribe = async e => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try { const result = await apiRequest('/newsletter', { method: 'POST', body: { email } }); toast.success(result.message, { duration: 8000 }); setEmail(''); }
    catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  };
  return <div className="flex flex-col items-center justify-center text-center space-y-2 pt-8 pb-14">
    <h1 className="md:text-4xl text-2xl font-medium">Đăng ký nhận tin và giảm 20%</h1>
    <p className="md:text-base text-gray-500/80 pb-8">Đăng ký bằng email tài khoản và nhập WELCOME20 khi đặt hàng.</p>
    <form onSubmit={subscribe} className="flex items-center justify-between max-w-2xl w-full md:h-14 h-12">
      <input aria-label="Địa chỉ email" required value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-500/30 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500" type="email" placeholder="Nhập địa chỉ email" />
      <button disabled={saving} className="md:px-12 px-8 h-full text-white bg-orange-600 rounded-md rounded-l-none">{saving ? "Đang lưu..." : "Đăng ký"}</button>
    </form>
  </div>;
}
