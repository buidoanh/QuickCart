'use client';
import { useEffect, useRef, useState } from 'react';
import { topicLabels } from '@/lib/labels';
import { apiRequest } from '@/lib/api';
const topics = ['Order support', 'Product question', 'Seller enquiry', 'Other'];
const empty = { name: '', email: '', subject: 'Order support', orderId: '', message: '' };
export default function ContactForm({ initialOrderId, topic, onTopicChange, selection, onSavingChange }) {
  const [form,setForm] = useState({ ...empty, orderId: initialOrderId });
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [reference,setReference] = useState('');
  const [delivered,setDelivered] = useState(false);
  const busy = useRef(false);
  const requestId = useRef(null);
  useEffect(() => {
    setReference(''); requestId.current = null;
  }, [selection]);
  useEffect(() => {
    setForm(previous => ({ ...previous, orderId: initialOrderId }));
    requestId.current = null;
  }, [initialOrderId]);
  const change = event => {
    if (event.target.name === 'subject') onTopicChange(event.target.value); setForm(previous => ({...previous,[event.target.name]:event.target.value})); requestId.current = null; };
  async function submit(event) {
    event.preventDefault(); if (busy.current) return;
    busy.current = true; setSaving(true); onSavingChange(true); setError('');
    try {
      if (!requestId.current) requestId.current = crypto.randomUUID();
      const result = await apiRequest('/contact',{method:'POST',body:{...form,subject:topic,requestId:requestId.current}});
      setDelivered(result.delivery === 'sent'); setReference(result.reference); setForm(empty); requestId.current = null;
    } catch (error) { setError(error.message); }
    finally { busy.current = false; setSaving(false); onSavingChange(false); }
  }
  const input = 'mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50';
  return <div id="contact-form" data-contact-form className="border border-gray-200 rounded-3xl p-6 md:p-9 shadow-sm">
    {reference ? <div role="status" className="py-8"><span className="inline-flex bg-orange-50 text-orange-600 h-14 w-14 rounded-full items-center justify-center text-2xl" aria-hidden="true">&#10003;</span><h2 className="text-2xl font-medium text-gray-900 mt-6">Đã nhận tin nhắn.</h2><p className="mt-4 text-gray-600 leading-7">{delivered ? "Tin nhắn của bạn đã được gửi đến hộp thư hỗ trợ." : "Chúng tôi đã nhận được tin nhắn của bạn."} Hãy giữ mã liên hệ này để tiện theo dõi.</p><p className="mt-4 text-sm font-mono break-all bg-gray-50 p-4 rounded-xl">{reference}</p><button type="button" onClick={()=>setReference('')} className="mt-6 text-orange-600 hover:underline">Gửi tin nhắn khác &rarr;</button></div> : <form onSubmit={submit}>
      <h2 className="text-2xl font-medium text-gray-900">Gửi tin nhắn</h2><p className="text-gray-500 text-sm mt-2">Các trường có dấu * là bắt buộc.</p>
      <fieldset disabled={saving} className="mt-7 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5"><label className="text-sm font-medium">Họ và tên *<input name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={change} className={input} /></label><label className="text-sm font-medium">Địa chỉ email *<input name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={change} className={input} /></label></div>
        <label className="block text-sm font-medium">Chủ đề *<select name="subject" value={topic} onChange={change} className={input}>{topics.map(topic=><option key={topic} value={topic}>{topicLabels[topic]}</option>)}</select></label>
        <label className="block text-sm font-medium">Mã đơn hàng <span className="text-gray-400 font-normal">(không bắt buộc)</span><input name="orderId" maxLength={100} value={form.orderId} onChange={change} className={input} /><span className="block text-xs font-normal text-gray-500 mt-2">Xem mã tại Đơn hàng của tôi hoặc bấm Hỗ trợ đơn hàng để tự điền mã.</span></label>
        <label className="block text-sm font-medium">Nội dung tin nhắn *<textarea name="message" rows={5} minLength={10} maxLength={3000} required value={form.message} onChange={change} className={input} /><span className="block text-right text-xs text-gray-400 mt-1">{form.message.length}/3000</span></label>
        <p className="text-xs leading-5 text-gray-500">Nhập email để nhận phản hồi. Không gửi mật khẩu hoặc thông tin thẻ thanh toán.</p>
        {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-full px-8 py-3">{saving ? "Đang gửi..." : "Gửi tin nhắn"} <span aria-hidden="true">&rarr;</span></button>
      </fieldset>
    </form>}
  </div>;
}
