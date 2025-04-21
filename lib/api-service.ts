import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
})

// Add a request interceptor to add the token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Auth API calls
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password })
    return response.data
  },

  register: async (email: string, password: string, username: string, phone: string) => {
    const response = await api.post("/users/register", { email, password, username, phone })
    return response.data
  },

  getMe: async () => {
    const response = await api.get("/users/me")
    return response.data
  },

  verifyOtp: async (otp: string) => {
    const response = await api.patch("/users/verify", { otp })
    return response.data
  },

  resendOtp: async () => {
    const response = await api.patch("/users/resent-otp")
    return response.data
  },
}

// Restaurant API calls
export const restaurantApi = {
  getAll: async () => {
    const response = await api.get("/restaurants")
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/restaurants/${id}`)
    return response.data
  },

  create: async (restaurantData: any) => {
    const response = await api.post("/restaurants", restaurantData)
    return response.data
  },

  update: async (id: string, restaurantData: any) => {
    const response = await api.patch(`/restaurants/${id}`, restaurantData)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/restaurants/${id}`)
    return response.data
  },
}

// Reservation API calls
export const reservationApi = {
  getOwned: async () => {
    const response = await api.get("/reservations")
    return response.data
  },

  create: async (restaurantId: string, reservationData: any) => {
    const response = await api.post(`/reservations/${restaurantId}`, reservationData)
    return response.data
  },

  update: async (id: string, reservationData: any) => {
    const response = await api.patch(`/reservations/${id}`, reservationData)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/reservations/${id}`)
    return response.data
  },
}

export default api
