import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth token interceptor — injects Supabase JWT on every request
api.interceptors.request.use(async (config) => {
  const { supabase } = await import("./supabase");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 — session expired
    if (error.response?.status === 401) {
      // The auth store listener will handle this
      console.warn("[API] Unauthorized — session may have expired");
    }
    return Promise.reject(error);
  }
);

export default api;
