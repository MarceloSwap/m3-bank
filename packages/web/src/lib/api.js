import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3334/api'
});

let unauthorizedHandler = null;

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization && typeof window !== 'undefined') {
    const storedSession = window.localStorage.getItem('m3-bank-auth');
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof unauthorizedHandler === 'function') {
      unauthorizedHandler(error);
    }
    return Promise.reject(error);
  }
);

export function setApiToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function setApiUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export default api;
