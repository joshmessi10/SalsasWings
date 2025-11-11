// frontend/src/lib/api.js
const fromEnv = (import.meta?.env?.VITE_API_URL || '').trim();

// En dev: si no hay VITE_API_URL, usar http://localhost:3000.
// En prod (Render): same-origin (cadena vacía).
export const API =
  fromEnv || (import.meta.env.DEV ? 'http://localhost:3000' : '');

// Pequeña utilidad para GET que valida JSON
export async function get(url, opts) {
  const res = await fetch(`${API}${url}`, { credentials: 'omit', ...opts });
  const ct = res.headers.get('content-type') || '';

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} @ ${API}${url}\n${txt.slice(0, 300)}`);
  }
  if (!ct.includes('application/json')) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Esperaba JSON pero recibí "${ct}" desde ${API}${url}\n${txt.slice(0, 300)}`);
  }
  return res.json();
}

export async function post(url, body, opts = {}) {
  const res = await fetch(`${API}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    ...opts,
  });
  return res.json();
}

export async function put(url, body, opts = {}) {
  const res = await fetch(`${API}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    ...opts,
  });
  return res.json();
}
