import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true // cookies automatically will go
})

// on every request add access token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// if 404 error comes, takes new access token from refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await axios.post('http://localhost:5000/auth/refresh', {}, {
          withCredentials: true
        })
        const newToken = res.data.accessToken
        localStorage.setItem('accessToken', newToken)
        error.config.headers.Authorization = `Bearer ${newToken}`
        return axios(error.config)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api