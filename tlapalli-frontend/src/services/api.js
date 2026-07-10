import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ¡Importante! Para enviar cookies
});

// Variables en memoria (no localStorage)
let accessToken = null;
let refreshUrl = '/auth/refresh';
let loginRedirectUrl = '/login';
let onRefreshed = null;
let isRefreshing = false;
let failedQueue = [];

// Procesar cola de peticiones fallidas
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de petición: agrega el token JWT
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor de respuesta: maneja errores 401 y refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no hay respuesta del servidor (error de red)
    if (!error.response) {
      console.warn('[API] Error de red:', error.message);
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Logging en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} -> ${status}`, data);
    }

    // Si es 401 y no es la ruta de refresh ni de login
    if (status === 401 && !originalRequest._retry &&
        !originalRequest.url.includes('/auth/refresh') &&
        !originalRequest.url.includes('/auth/login')) {

      // Si ya está refrescando, poner en cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refrescar el token
        const { data: refreshData } = await axios.post(`${API_URL}${refreshUrl}`, {}, {
          withCredentials: true,
        });

        accessToken = refreshData.accessToken;

        // Notificar a los listeners
        if (onRefreshed) onRefreshed(accessToken);
        processQueue(null, accessToken);

        // Reintentar petición original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        // Limpiar y redirigir al login
        accessToken = null;
        if (onRefreshed) onRefreshed(null);
        window.location.href = loginRedirectUrl;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Si es 429 (rate limit), log advertencia
    if (status === 429) {
      console.warn('[API] Rate limit alcanzado:', data?.message);
    }

    return Promise.reject(error);
  }
);

// Funciones para manejar el token desde fuera
export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export const setOnRefreshed = (callback) => {
  onRefreshed = callback;
};

export const setRefreshUrl = (url) => {
  refreshUrl = url;
};

export const setLoginRedirectUrl = (url) => {
  loginRedirectUrl = url;
};

export default api;
