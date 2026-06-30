import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
};

export const chat = {
  ask: (data) => api.post("/api/chat", data),
  askStream: (data) => api.post("/api/chat/stream", data),
};

export const documents = {
  list: () => api.get("/api/documents"),
  remove: (id) => api.delete(`/api/documents/${id}`),
  upload: (formData, signal) =>
    api.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
    }),
};

export const conversations = {
  list: () => api.get("/api/conversations"),
  getOne: (id) => api.get(`/api/conversations/${id}`),
  remove: (id) => api.delete(`/api/conversations/${id}`),
  rename: (id, title) => api.patch(`/api/conversations/${id}`, { title }),
};

export const health = {
  check: () => api.get("/health"),
};

export const llm = {
  getProviders: () => api.get("/api/llm/providers"),
};

export const admin = {
  getStats: () => api.get("/api/admin/stats"),
  getUsers: (params) => api.get("/api/admin/users", { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  updateUser: (id, data) => api.patch(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getUsage: (params) => api.get("/api/admin/usage", { params }),
  getUsageSummary: () => api.get("/api/admin/usage/summary"),
  getSettings: () => api.get("/api/admin/settings"),
  updateSettings: (data) => api.put("/api/admin/settings", data),
  getAudit: (params) => api.get("/api/admin/audit", { params }),
  getAllDocuments: (params) => api.get("/api/admin/documents", { params }),
  getChartUsage: () => api.get("/api/admin/chart/usage"),
  getChartUsers: () => api.get("/api/admin/chart/users"),
  getChartProviders: () => api.get("/api/admin/chart/providers"),
  getChartDailyAudit: () => api.get("/api/admin/chart/daily-audit"),
};

export default api;
