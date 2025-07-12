export async function apiFetch(url, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error('API base URL is not set. Please configure NEXT_PUBLIC_API_URL in your environment.');
  const fullUrl = url.startsWith('http') ? url : baseUrl + url;
  const res = await fetch(fullUrl, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
} 