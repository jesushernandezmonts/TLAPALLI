import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setAccessToken } from '../services/api';
import { Loader2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Guardar token en memoria
      setAccessToken(token);

      // 2. Decodificar para el estado global
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

        // 3. Redirigir según rol
        if (payload.rol === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/mis-grupos');
        }
      } catch (error) {
        console.error('Error decoding token', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
        <h2 className="text-white text-xl font-bold">Procesando inicio de sesión...</h2>
        <p className="text-white/40 text-sm mt-2">Por favor espera un momento.</p>
      </div>
    </div>
  );
}

export default AuthSuccess;
