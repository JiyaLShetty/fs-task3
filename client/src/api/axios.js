import axios from "axios";

const BASE = "http://localhost:8000/api";
const api = axios.create({ baseURL: BASE, withCredentials: true });

let accessToken = null;
export const setApiToken = (t) => {
  accessToken = t;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const isAuthRoute = original.url.startsWith("/auth/");
    if (err.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        setApiToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        setApiToken(null);
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
