const RAW = import.meta?.env?.VITE_API_URL ?? '';
export const API = (RAW || '').replace(/\/+$/, ''); // sin slash al final

const join = (u) => `${API}${u.startsWith('/') ? u : `/${u}`}`;

export const get = async (url, opts) => {
  const full = join(url);
  console.log('[API][GET]', full);
  const res = await fetch(full, { credentials: 'omit', ...(opts || {}) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${full} -> ${res.status} ${res.statusText} ${text}`);
  }
  return res;
};

export const post = async (url, body, opts = {}) => {
  const full = join(url);
  console.log('[API][POST]', full, body);
  const res = await fetch(full, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    credentials: 'omit',
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${full} -> ${res.status} ${res.statusText} ${text}`);
  }
  return res;
};

export const put = async (url, body, opts = {}) => {
  const full = join(url);
  console.log('[API][PUT]', full, body);
  const res = await fetch(full, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    credentials: 'omit',
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`PUT ${full} -> ${res.status} ${res.statusText} ${text}`);
  }
  return res;
};
