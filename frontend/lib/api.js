import axios from "axios";
import { pushToast } from "./toast-bridge";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API });

export function setAuth(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("jc_access", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("jc_access");
  }
}

export function loadAuth() {
  const t = typeof window !== "undefined" ? localStorage.getItem("jc_access") : null;
  if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`;
  return t;
}

// auto refresh once on 401
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("jc_refresh");
      if (refresh) {
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, { refresh });
          localStorage.setItem("jc_access", data.tokens.access);
          localStorage.setItem("jc_refresh", data.tokens.refresh);
          api.defaults.headers.common.Authorization = `Bearer ${data.tokens.access}`;
          original.headers.Authorization = `Bearer ${data.tokens.access}`;
          return api(original);
        } catch (_) {
          localStorage.removeItem("jc_access");
          localStorage.removeItem("jc_refresh");
        }
      }
      // refresh missing/failed:
pushToast && pushToast("Session expired, please login again", "error");
if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
