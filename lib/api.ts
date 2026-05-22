import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Auto attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth endpoints
export const authAPI = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me')
}

// Channel endpoints
export const channelAPI = {
  getAll: () => api.get('/channels/'),
  create: (data: any) => api.post('/channels/', data),
  getById: (id: string) => api.get(`/channels/${id}`)
}

// Sensor endpoints
export const sensorAPI = {
  getLatest: (channelId: string) =>
    api.get(`/sensors/${channelId}/latest`),
  getHistory: (channelId: string, limit = 50) =>
    api.get(`/sensors/${channelId}/history?limit=${limit}`),
  addData: (channelId: string, data: any) =>
    api.post(`/sensors/${channelId}`, data)
}
