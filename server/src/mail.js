import nodemailer from 'nodemailer';
import { z } from 'zod';
const topics = { 'Order support': 'Hỗ trợ đơn hàng', 'Product question': 'Câu hỏi về sản phẩm', 'Seller enquiry': 'Hỗ trợ người bán', Other: 'Khác' };
export function contactMailConfigured(env = process.env) {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.CONTACT_EMAIL);
}
export function contactMailOptions(message, env = process.env) {
  const email = z.email();
  const from = email.parse(env.SMTP_FROM || env.SMTP_USER);
  const to = email.parse(env.CONTACT_EMAIL);
  return {
    from: { name: 'QuickCart', address: from }, to,
    replyTo: { name: message.name, address: message.email },
    subject: '[QuickCart] ' + (topics[message.subject] || message.subject) + ' - ' + String(message._id),
    text: ['Tin nhắn liên hệ QuickCart', '', 'Mã liên hệ: ' + message._id, 'Họ và tên: ' + message.name, 'Email: ' + message.email, 'Chủ đề: ' + (topics[message.subject] || message.subject), 'Mã đơn hàng: ' + (message.orderId || 'Không cung cấp'), '', message.message].join('\n'),
    disableFileAccess: true, disableUrlAccess: true,
  };
}
export async function sendContactNotification(message) {
  const port = Number(process.env.SMTP_PORT || 465);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid SMTP port');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  const result = await transporter.sendMail(contactMailOptions(message));
  if (!result.accepted?.length || result.rejected?.length) throw new Error('Email was not accepted');
}
