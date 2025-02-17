import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
})

export const auth = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
}

export const products = {
  getAll: () => api.get("/products"),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

export const orders = {
  getMyOrders: () => api.get("/orders/my-orders"),
  create: (data) => api.post("/orders", data),
  getAllOrders: () => api.get("/orders"),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

export default api

