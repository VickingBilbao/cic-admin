/**
 * CIC Admin API Client
 * All calls go to the same backend with Super Admin JWT
 */

const BASE = import.meta.env.VITE_API_URL || 'https://cic-backend-production-74a6.up.railway.app/api/v1'

function getToken() {
  return localStorage.getItem('cic_admin_token')
}

async function request(path, opts = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Erro na requisição'), { status: res.status, data })
  return data
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  // ── Stats ─────────────────────────────────────────────────────────────────
  stats: () => request('/sadmin/stats'),

  // ── Orgs ──────────────────────────────────────────────────────────────────
  orgs:       ()         => request('/sadmin/orgs'),
  org:        (id)       => request(`/sadmin/orgs/${id}`),
  createOrg:  (body)     => request('/sadmin/orgs', { method: 'POST', body }),
  updateOrg:  (id, body) => request(`/sadmin/orgs/${id}`, { method: 'PATCH', body }),
  updateSeats:(id, seats_limit) => request(`/sadmin/orgs/${id}/seats`, { method: 'PATCH', body: { seats_limit } }),
  impersonate:(id)       => request(`/sadmin/orgs/${id}/impersonate`, { method: 'POST' }),

  // ── Members ───────────────────────────────────────────────────────────────
  members:       (id)          => request(`/sadmin/orgs/${id}/members`),
  addMember:     (id, body)    => request(`/sadmin/orgs/${id}/members`, { method: 'POST', body }),
  updateMember:  (id, uid, role) => request(`/sadmin/orgs/${id}/members/${uid}`, { method: 'PATCH', body: { role } }),
  removeMember:  (id, uid)     => request(`/sadmin/orgs/${id}/members/${uid}`, { method: 'DELETE' }),

  // ── Plans ─────────────────────────────────────────────────────────────────
  plans:      ()         => request('/sadmin/plans'),
  createPlan: (body)     => request('/sadmin/plans', { method: 'POST', body }),
  updatePlan: (id, body) => request(`/sadmin/plans/${id}`, { method: 'PATCH', body }),
}

export function saveToken(token) {
  localStorage.setItem('cic_admin_token', token)
}
export function clearToken() {
  localStorage.removeItem('cic_admin_token')
}
