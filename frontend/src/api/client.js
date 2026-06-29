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

export default api;
