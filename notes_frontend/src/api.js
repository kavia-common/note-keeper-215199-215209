const DEFAULT_BASE = 'http://localhost:3001';

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns the API base URL from env (REACT_APP_API_BASE) or default. */
  const base = process.env.REACT_APP_API_BASE || DEFAULT_BASE;
  return base.replace(/\/+$/, '');
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
