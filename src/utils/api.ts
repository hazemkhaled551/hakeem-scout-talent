import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const lang = localStorage.getItem("i18nextLng") || "en";

  config.headers["Accept-Language"] = lang;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    /* ===== HANDLE TOKEN EXPIRE ===== */

    if (
      (error.response.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/refreshToken")) ||
      error.response.data.message ===
        "invalid tokenTokenExpiredError: jwt expired"
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await api.post(
          "/auth/refreshToken",
          {},
          { withCredentials: true },
        );

        const newToken = res.data.data.accessToken;

        localStorage.setItem("token", newToken);

        api.defaults.headers.Authorization = `Bearer ${newToken}`;

        failedQueue.forEach((p) => p.resolve(newToken));
        failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (err) {
        console.log(err);

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    /* ===== NORMAL ERRORS ===== */

    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);

    return Promise.reject(error);
  },
);

export default api;
