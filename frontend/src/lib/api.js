const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

async function request(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || data.detail || 'Request failed')
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
    return request('/complaints/?view=active')
  },

  listResolvedComplaints() {
    return request('/complaints/?view=resolved')
  },

  saveFeedback(id, feedback) {
    return request(`/complaints/${id}/feedback/`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    })
  },

  updateComplaintStatus(id, status, feedback = '') {
    const body = { status }
    if (feedback?.trim()) {
      body.feedback = feedback.trim()
    }
    return request(`/complaints/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  adminLogin(username, password) {
    return request('/admin_login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
}
