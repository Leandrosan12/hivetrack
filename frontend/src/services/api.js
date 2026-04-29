const API_URL = 'http://192.168.100.91:3000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Error de conexión');
  }

  return data;
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  summary: () => request('/summary'),

  listApiarios: () => request('/apiarios'),
  createApiario: (payload) => request('/apiarios', { method: 'POST', body: JSON.stringify(payload) }),
  deleteApiario: (id) => request(`/apiarios/${id}`, { method: 'DELETE' }),

  listAgricultores: () => request('/agricultores'),
  createAgricultor: (payload) => request('/agricultores', { method: 'POST', body: JSON.stringify(payload) }),
  deleteAgricultor: (id) => request(`/agricultores/${id}`, { method: 'DELETE' }),

  listColmenas: () => request('/colmenas'),
  createColmena: (payload) => request('/colmenas', { method: 'POST', body: JSON.stringify(payload) }),
  deleteColmena: (id) => request(`/colmenas/${id}`, { method: 'DELETE' }),

  listContratos: () => request('/contratos'),
  createContrato: (payload) => request('/contratos', { method: 'POST', body: JSON.stringify(payload) }),
  deleteContrato: (id) => request(`/contratos/${id}`, { method: 'DELETE' }),

  listMovimientos: () => request('/movimientos'),
  createMovimiento: (payload) => request('/movimientos', { method: 'POST', body: JSON.stringify(payload) }),
  deleteMovimiento: (id) => request(`/movimientos/${id}`, { method: 'DELETE' })
};