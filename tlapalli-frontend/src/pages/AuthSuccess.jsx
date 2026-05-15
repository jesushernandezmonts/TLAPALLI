import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      const userData = loginWithToken(token);
      
      if (userData) {
        // Redirigir según rol
        if (userData.rol === 'admin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/mis-grupos', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, loginWithToken]);

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
