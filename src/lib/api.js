import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export const auth = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  googleSignIn: (token) => api.post("/auth/google-signin", { token }),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

export const products = {
  getAll: () => api.get("/products"),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const orders = {
  getMyOrders: () => api.get("/orders/my-orders"),
  create: (data) => api.post("/orders", data),
  createRazorpayOrder: (data) => api.post("/orders/create-order", data),
  verifyPayment: (data) => api.post("/orders/verify-payment", data),
  getAll: () => api.get("/orders"),
  getAllOrders: () => api.get("/orders"),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export default api;
