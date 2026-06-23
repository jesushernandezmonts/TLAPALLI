import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAccessToken, clearAccessToken, setOnRefreshed } from '../services/api';
import { jwtDecode } from 'jwt-decode';

export function useAlumnoAuth() {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios de token
  useEffect(() => {
    setOnRefreshed((token) => {
      if (!token) {
        setAlumno(null);
      }
    });
  }, []);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await api.post('/auth/alumno/refresh');
        setAccessToken(data.accessToken);
        const payload = jwtDecode(data.accessToken);
        setAlumno({
          id: payload.sub,
          nombre: payload.nombre,
          email: payload.email,
          fotoUrl: payload.fotoUrl,
        });
      } catch (err) {
        setAlumno(null);
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/alumno/login', { email, password });
    setAccessToken(data.accessToken);
    setAlumno(data.alumno);
    setLoading(false);
    return data.alumno;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/alumno/logout');
    } catch (err) {
      // Ignorar errores
    } finally {
      clearAccessToken();
      setAlumno(null);
      setLoading(false);
    }
  }, []);

  return { alumno, setAlumno, loading, login, logout };
}
