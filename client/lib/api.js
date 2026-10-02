export async function apiRequest(path, { token, body, ...options } = {}) {
  const form = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = { ...(!form && body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  let response;
  try { response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '')}${path}`, { ...options, headers, body: body === undefined ? undefined : form ? body : JSON.stringify(body), cache: 'no-store' }); }
  catch { throw new Error('Không thể kết nối máy chủ. Vui lòng thử lại.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) throw new Error(data.message || `Lỗi kết nối (${response.status})`);
  return data;
}
