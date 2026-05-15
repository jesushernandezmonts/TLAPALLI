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
      if (window.location.pathname.includes('/auth/success') || params.has('token')) {
        setLoading(false);
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
    if (!token) return null;
    
    setAccessToken(token);
    try {
      const payload = jwtDecode(token);
      const userData = {
        id: payload.sub,
        email: payload.email,
        rol: payload.rol,
        nombre: payload.nombre,
        instructorId: payload.instructorId,
      };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (error) {
      console.error('Error decoding token', error);
      clearAccessToken();
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
