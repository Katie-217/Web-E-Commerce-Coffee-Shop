// Minimal fetch wrapper for frontend API calls
// - Base URL from Vite env: VITE_API_BASE_URL
// - JSON by default
// - Basic error handling and timeout support

const DEFAULT_TIMEOUT_MS = 15000;

function buildUrl(path) {
  // Default API base URL if not set in env
  // Backend chạy trên port 3001, frontend trên port 3000
  const base = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:3001/api';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function applyQuery(url, params) {
  if (!params) return url;
  // Expect an absolute URL here; preserve origin and pathname
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((item) => u.searchParams.append(k, String(item)));
    else u.searchParams.set(k, String(v));
  });
  return u.toString();
}

let authTokenProvider = null; // optional callback to get token
export function setAuthTokenProvider(fn) { authTokenProvider = fn; }

async function request(path, { method = 'GET', headers, body, params, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const mergedSignal = signal ? new AbortController() : null;
  if (mergedSignal && signal) {
    signal.addEventListener('abort', () => mergedSignal.abort());
  }

  try {
    const urlWithQuery = params ? applyQuery(buildUrl(path), params) : buildUrl(path);
    const authHeader = authTokenProvider ? await authTokenProvider() : null;
    const res = await fetch(urlWithQuery, {
      method,
      headers: {
        'Accept': 'application/json',
        ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(authHeader ? { Authorization: typeof authHeader === 'string' ? authHeader : `Bearer ${authHeader.token || authHeader}` } : {}),
        ...headers,
      },
      body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
      signal: mergedSignal ? mergedSignal.signal : controller.signal,
      // No cookies required for this API; avoid CORS credential issues
      credentials: 'omit',
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : await res.text();

    if (!res.ok) {
      const error = new Error((data && data.message) || `HTTP ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get: (path, options) => request(path, { method: 'GET', ...(options || {}) }),
  post: (path, body, options) => request(path, { method: 'POST', body, ...(options || {}) }),
  put: (path, body, options) => request(path, { method: 'PUT', body, ...(options || {}) }),
  patch: (path, body, options) => request(path, { method: 'PATCH', body, ...(options || {}) }),
  delete: (path, options) => request(path, { method: 'DELETE', ...(options || {}) }),
};

export default apiClient;


