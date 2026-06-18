const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')
export const ADMIN_TOKEN_KEY = 'whispr_admin_token'
export const ADMIN_ORG_KEY = 'whispr_admin_org'

function authHeaders() {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}, { auth = false } = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 401 && auth) {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    sessionStorage.removeItem(ADMIN_ORG_KEY)
  }

  if (!response.ok) {
    const fallback = response.status === 401
      ? 'Invalid credentials or insufficient permissions.'
      : response.status >= 500
        ? 'Server error. Please try again later.'
        : 'Request failed'
    throw new Error(data.error || data.detail || fallback)
  }

  return data
}

export const api = {
  createComplaint(body) {
    return request('/complaints/', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  getComplaintByToken(token) {
    return request('/complaint_by_token/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  },

  listActiveComplaints() {
    return request('/complaints/?view=active', {}, { auth: true })
  },

  listResolvedComplaints() {
    return request('/complaints/?view=resolved', {}, { auth: true })
  },

  saveFeedback(id, feedback) {
    return request(`/complaints/${id}/feedback/`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    }, { auth: true })
  },

  updateComplaintStatus(id, status, feedback = '') {
    const body = { status }
    if (feedback?.trim()) {
      body.feedback = feedback.trim()
    }
    return request(`/complaints/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, { auth: true })
  },

  adminLogin(organization, username, password) {
    return request('/admin_login/', {
      method: 'POST',
      body: JSON.stringify({ organization, username, password }),
    })
  },
}
