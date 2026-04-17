import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('asas_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('asas_token')
            localStorage.removeItem('asas_user')

            // Only redirect if the error is not from the login page itself
            if (error.config && !error.config.url.includes('/auth/login')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    guest: (data) => api.post('/auth/guest', data),
    guestQuota: () => api.get('/auth/guest/quota'),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
}

// Analysis
export const analysisAPI = {
    analyzeText: (text) => api.post('/analyze/text', { text }),
    uploadFile: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/analyze/file', formData, {
            headers: {
                'Content-Type': undefined
            }
        })
    },
    getFileJobStatus: (jobId) => api.get(`/analyze/file/status/${jobId}`),
}

// History
export const historyAPI = {
    getHistory: (params) => api.get('/history', { params }),
    getAnalysis: (id) => api.get(`/history/${id}`),
    deleteAnalysis: (id) => api.delete(`/history/${id}`),
    getBatch: (batchId) => api.get(`/history/batch/${batchId}`),
}

// Reports
export const reportsAPI = {
    listReports: () => api.get('/reports'),
    generateReport: (data) => api.post('/reports/generate', data),
    getReport: (id) => api.get(`/reports/${id}`),
    deleteReport: (id) => api.delete(`/reports/${id}`),
}

// Dashboard
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getTrends: (days) => api.get('/dashboard/trends', { params: { days } }),
}

export default api
