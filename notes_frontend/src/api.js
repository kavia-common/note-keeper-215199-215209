const DEFAULT_LOCAL_BASE = 'http://localhost:3001';

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns the API base URL from env (REACT_APP_API_BASE) or sensible defaults.
   * Priority:
   * 1) REACT_APP_API_BASE if set
   * 2) If running in browser:
   *    - If current port is 3000, infer backend at same host:3001 with same protocol (avoid mixed content)
   *    - Otherwise, try same-origin (assumes reverse proxy)
   * 3) Fallback to localhost:3001
   */
  const envBase = process.env.REACT_APP_API_BASE;
  if (envBase && typeof envBase === 'string') {
    return envBase.replace(/\/*$/, '');
  }

  if (typeof window !== 'undefined' && window.location && window.location.href) {
    try {
      const url = new URL(window.location.href);
      const proto = url.protocol; // 'http:' or 'https:'
      const host = url.hostname;
      const port = url.port;

      // If the frontend runs on port 3000 (dev/preview), backend is typically on 3001 same host
      if (port === '3000') {
        return `${proto}//${host}:3001`;
      }

      // Otherwise, try same origin (useful when reverse proxy serves the API)
      return window.location.origin.replace(/\/*$/, '');
    } catch {
      // ignore parsing errors
    }
  }

  return DEFAULT_LOCAL_BASE.replace(/\/*$/, '');
}

/**
 * Internal helper to handle fetch with JSON and simple error handling.
 */
async function request(path, options = {}) {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Fetch list of notes; expected fields: id/_id, title, updatedAt */
  return request('/notes', { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function getNote(id) {
  /** Fetch a single note by id. */
  return request(`/notes/${encodeURIComponent(id)}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function createNote(note) {
  /** Create a new note with fields: title, content */
  return request('/notes', { method: 'POST', body: JSON.stringify(note) });
}

// PUBLIC_INTERFACE
export async function updateNote(id, note) {
  /** Update an existing note by id with fields: title, content */
  return request(`/notes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(note) });
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note by id. */
  return request(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
