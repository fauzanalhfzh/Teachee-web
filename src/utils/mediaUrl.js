const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://129.212.190.27:8001/api/v1';

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  const apiOrigin = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '');
  if (trimmed.startsWith('/')) return `${apiOrigin}${trimmed}`;
  return `${apiOrigin}/${trimmed}`;
}
