import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api, { setAccessToken, clearAccessToken, setOnRefreshed } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { Loader2 } from 'lucide-react';

function AlumnoPrivateRoute() {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!alumno) {
    return <Navigate to="/alumno/login" replace />;
  }

  return <Outlet context={{ alumno }} />;
}

export default AlumnoPrivateRoute;
