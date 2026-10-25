const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Please try again.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const signup = (body) => request('/api/auth/signup', { method: 'POST', body })
export const login = (body) => request('/api/auth/login', { method: 'POST', body })
export const getMe = (token) => request('/api/auth/me', { token })

// Admin
export const getUsers = (token) => request('/api/admin/users', { token })
export const setUserRole = (token, id, role) =>
  request(`/api/admin/users/${id}/role`, { method: 'PATCH', body: { role }, token })
export const deleteUser = (token, id) =>
  request(`/api/admin/users/${id}`, { method: 'DELETE', token })
