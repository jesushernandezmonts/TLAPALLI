import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken, user } = useAuth();
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = pending, true/false = resultado

  // Paso 1: Procesar el token UNA sola vez al montar
  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const userData = loginWithToken(token);
    setTokenValid(!!userData);
    setTokenProcessed(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // Paso 2: Navegar DESPUÉS de que React haya aplicado el estado del usuario
  useEffect(() => {
    if (!tokenProcessed) return;

    if (!tokenValid) {
      navigate('/login', { replace: true });
      return;
    }

    // Esperar a que user esté disponible en el contexto
    if (user) {
      if (user.rol === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/mis-grupos', { replace: true });
      }
    }
  }, [tokenProcessed, tokenValid, user, navigate]);

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
