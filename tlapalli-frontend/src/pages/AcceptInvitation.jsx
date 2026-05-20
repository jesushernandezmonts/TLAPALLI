import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, UserCheck } from 'lucide-react';
import api from '../services/api';

const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
  </svg>
);

function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profesor, setProfesor] = useState(null);
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const validateToken = async () => {
      try {
        const { data } = await api.get(`/auth/validate-invitation?token=${token}`);
        setProfesor(data);
      } catch (err) {
        setError(err.response?.data?.message || 'El enlace de invitación es inválido o ha expirado.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleLinkGoogle = () => {
    if (!token) return;
    window.location.href = `http://localhost:3000/auth/google?state=${token}`;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-['Outfit']">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/60 via-purple-900/60 to-orange-900/60 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/huamantla-bg.jpg')" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 w-full max-w-lg px-4"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-12 h-12 text-pink-400 animate-spin mb-4" />
              <p className="text-white/80 font-medium">Validando tu invitación...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30"
              >
                <AlertCircle className="w-10 h-10 text-red-400" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-4">Enlace Inválido</h2>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                {error}
              </p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-bold transition-colors"
              >
                Volver al inicio de sesión →
              </Link>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="flex flex-col items-center mb-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-white/20"
                >
                  <UserCheck className="w-10 h-10 text-pink-400" />
                </motion.div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">¡Hola, {profesor?.nombre}!</h1>
                <p className="text-white/60 text-sm">
                  Has sido invitado a unirte a <strong>Tlapalli</strong> como Profesor.
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8 space-y-4">
                <p className="text-sm text-white/70 text-center leading-relaxed">
                  Para acceder a tu cuenta, debes vincular tu correo institucional o personal de Google. No necesitas crear ninguna contraseña.
                </p>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                  <span className="text-xs text-white/40 block mb-1">Correo registrado:</span>
                  <span className="text-sm font-semibold text-pink-300">{profesor?.email}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLinkGoogle}
                className="w-full flex items-center justify-center gap-3 h-16 bg-white rounded-2xl font-black text-slate-900 hover:bg-slate-100 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] group"
              >
                <GoogleIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
                Vincular e Iniciar Sesión con Google
              </motion.button>

              <p className="text-[10px] text-center text-white/30 mt-6">
                Al hacer clic, serás redirigido a Google para autorizar la vinculación segura de tu cuenta.
              </p>
            </div>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/40 mt-8 text-sm"
        >
          © 2026 Tlapalli. Todos los derechos reservados.
        </motion.p>
      </motion.div>
    </div>
  );
}

export default AcceptInvitation;
