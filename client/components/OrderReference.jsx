'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
export default function OrderReference({ orderId }) {
  const [copied, setCopied] = useState(false);
  async function copyId() {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
    } catch { toast.error("Không thể sao chép. Vui lòng chọn và sao chép mã đơn bên dưới."); }
  }
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-3 bg-gray-50 rounded-xl px-4 py-3">
    <div className="min-w-0"><span className="text-xs text-gray-500 block">Mã đơn hàng</span><span className="font-mono text-sm text-gray-800 break-all select-all">{orderId}</span></div>
    <button type="button" onClick={copyId} aria-label="Sao chép mã đơn hàng" className="text-orange-600 hover:underline text-sm">{copied ? "Đã sao chép!" : "Sao chép"}</button>
    <Link href={'/contact?orderId=' + encodeURIComponent(orderId) + '#contact-form'} className="text-orange-600 hover:underline text-sm md:ml-auto">Hỗ trợ đơn hàng &rarr;</Link>
  </div>;
}
