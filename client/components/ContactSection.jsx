'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ContactForm from '@/components/ContactForm';
const topics = [
  ['01', 'Hỗ trợ đơn hàng', 'Order support', "Thông tin giao hàng, trạng thái đơn và các câu hỏi về đơn đã đặt."],
  ['02', 'Câu hỏi về sản phẩm', 'Product question', "Tư vấn thiết bị, so sánh danh mục và thông tin sản phẩm."],
  ['03', 'Hỗ trợ người bán', 'Seller enquiry', "Hỗ trợ đăng và quản lý sản phẩm trên QuickCart."],
];
export default function ContactSection() {
  const params = useSearchParams();
  const requestedOrder = params.get('orderId') || '';
  const initialOrderId = /^[a-f0-9]{24}$/i.test(requestedOrder) ? requestedOrder : '';
  const [topic, setTopic] = useState('Order support');
  const [saving, setSaving] = useState(false);
  const [selection, setSelection] = useState(0);
  const container = useRef(null);
  function chooseTopic(value) {
    setTopic(value); setSelection(previous => previous + 1);
    requestAnimationFrame(() => {
      const form = container.current?.querySelector('[data-contact-form]');
      form?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form?.querySelector('textarea')?.focus({ preventScroll: true });
    });
  }
  return <section ref={container} className="grid lg:grid-cols-[1fr_1.45fr] gap-10 lg:gap-16 py-14 md:py-20">
    <aside><h2 className="text-2xl font-medium text-gray-900">Bạn cần hỗ trợ điều gì?</h2><p className="mt-4 text-gray-600 leading-7">Chọn chủ đề bên dưới để bắt đầu gửi tin nhắn.</p>
      <div className="mt-8 space-y-4">{topics.map(([number,title,value,copy]) => <button key={value} type="button" disabled={saving} aria-pressed={topic === value} onClick={() => chooseTopic(value)} className={'w-full text-left border rounded-2xl p-5 flex gap-4 transition hover:border-orange-600 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-60 ' + (topic === value ? 'border-orange-600 bg-orange-50/50' : 'border-gray-200')}>
        <span className="bg-orange-50 text-orange-600 rounded-full h-10 w-10 flex items-center justify-center shrink-0 text-sm">{number}</span>
        <span><span className="block font-medium text-gray-900">{title}</span><span className="block text-sm leading-6 text-gray-500 mt-1">{copy}</span></span>
      </button>)}</div>
      <Link href="/my-orders" className="inline-block mt-7 text-orange-600 hover:underline">Xem đơn hàng của tôi &rarr;</Link>
    </aside>
    <ContactForm initialOrderId={initialOrderId} topic={topic} onTopicChange={setTopic} selection={selection} onSavingChange={setSaving} />
  </section>;
}
