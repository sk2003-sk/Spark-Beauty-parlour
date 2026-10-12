import axios from 'axios';

// The short lived access token is kept in memory only (never in localStorage)
let accessToken = null;
export const setToken = (t) => { accessToken = t; };

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://spark-beauty-server.onrender.com/api', withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Many requests can fail at once, but only one refresh call is sent
let pending = null;
export function refreshSession() {
  pending ??= axios
    .post(`${api.defaults.baseURL}/auth/refresh`, null, { withCredentials: true })
    .then((res) => { setToken(res.data.accessToken); return res.data; })
    .finally(() => { pending = null; });
  return pending;
}

// If the access token expired, refresh it and repeat the request once
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        setToken(null);
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const errMsg = (e) => e.response?.data?.message || 'Something went wrong. Please try again.';
export const fieldErrors = (e) => e.response?.data?.details || {};
