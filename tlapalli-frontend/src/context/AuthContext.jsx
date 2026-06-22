import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAccessToken, clearAccessToken, setOnRefreshed } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bloqueoMsg, setBloqueoMsg] = useState(null);
  const navigate = useNavigate();

  // Escuchar cambios de token
  useEffect(() => {
    setOnRefreshed((token) => {
      if (!token) {
        setUser(null);
      }
    });
  }, []);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      // Si estamos en la página de éxito de OAuth o hay un token en la URL, 
      // dejamos que AuthSuccess maneje la sesión inicial para evitar conflictos.
      const params = new URLSearchParams(window.location.search);
      const publicPaths = ['/auth/success', '/login', '/forgot-password', '/reset-password', '/activar-cuenta', '/accept-invitation'];
      if (publicPaths.some(p => window.location.pathname.includes(p)) || params.has('token')) {
        // Dejamos que loading continúe en true para evitar redirección prematura en PrivateRoute
        return;
      }

      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        // Decodificar el JWT usando jwt-decode
        const payload = jwtDecode(data.accessToken);
        setUser({
          id: payload.sub,
          email: payload.email,
          rol: payload.rol,
          nombre: payload.nombre,
          instructorId: payload.instructorId,
          fotoUrl: payload.fotoUrl,
        });
      } catch (err) {
        // No hay sesión activa
        setUser(null);
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setBloqueoMsg(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.accessToken);
      setUser(data.usuario);
      setLoading(false);
      return data.usuario;
    } catch (err) {
      // Manejar error de bloqueo
      if (err.response?.status === 403 && err.response?.data?.message?.includes('bloqueada')) {
        setBloqueoMsg(err.response.data.message);
      }
      throw err;
    }
  }, []);

  const loginWithToken = useCallback((token) => {
    if (!token) {
      setLoading(false);
      return null;
    }
    
    setAccessToken(token);
    try {
      const payload = jwtDecode(token);
      const userData = {
        id: payload.sub,
        email: payload.email,
        rol: payload.rol,
        nombre: payload.nombre,
        instructorId: payload.instructorId,
        fotoUrl: payload.fotoUrl,
      };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (error) {
      console.error('Error decoding token', error);
      clearAccessToken();
      setLoading(false);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignorar errores
    } finally {
      clearAccessToken();
      setUser(null);
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const value = {
    user,
    setUser,
    loading,
    bloqueoMsg,
    setBloqueoMsg,
    login,
    loginWithToken,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
