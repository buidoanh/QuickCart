// Call only when making a request, never from middleware or build configuration.
export function apiUrl(path) {
  const apiPath = `api/${path.replace(/^\/+/, '')}`;
  if (typeof window === 'undefined' && process.env.QUICKCART_SERVER_URL) {
    // Preserve any path prefix in Vercel's generated binding URL.
    return new URL(apiPath, `${process.env.QUICKCART_SERVER_URL.replace(/\/+$/, '')}/`).href;
  }
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (base) return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  return `/${apiPath}`;
}
