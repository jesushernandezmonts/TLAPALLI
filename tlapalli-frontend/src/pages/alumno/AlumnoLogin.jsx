import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { setAccessToken } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AlumnoLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/alumno/login', { email, password }, { withCredentials: true });
      setAccessToken(data.accessToken);
      navigate('/alumno/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-['Outfit']">
      {/* Fondo con imagen + gradiente igual al sistema */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/60 via-purple-900/60 to-orange-900/60 z-10" />
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/huamantla-bg.jpg')" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-20 w-full max-w-lg px-4"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 mb-3 rounded-2xl overflow-hidden shadow-2xl border border-white/30"
            >
              <img src="/tlapalli-logo.png" alt="Tlapalli Logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-zinc-400 drop-shadow-sm">
              TLAPALLI
            </h1>
            <p className="text-white/60 mt-1 font-medium tracking-widest uppercase text-[10px]">
              Portal del Alumno — Centro Cultural Huamantla
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-left"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-300">Error de Acceso</p>
                    <p className="text-xs text-red-200/80 leading-relaxed mt-0.5">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Correo */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-white/80 ml-1">Correo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/15 transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-white/80 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/15 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón Iniciar Sesión */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full relative group h-12 overflow-hidden rounded-2xl font-bold text-white transition-all shadow-lg disabled:opacity-60"
              type="submit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-orange-600 to-pink-600 bg-[length:200%_auto] group-hover:bg-right transition-all duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Iniciando sesión...</>
                ) : (
                  <><LogIn className="w-5 h-5" /> Iniciar Sesión</>
                )}
              </span>
            </motion.button>

            {/* Volver */}
            <div className="text-center pt-1">
              <Link
                to="/login"
                className="text-xs text-white/40 hover:text-pink-400 transition-colors font-medium"
              >
                ← Volver al inicio de sesión principal
              </Link>
            </div>
          </form>
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

export default AlumnoLogin;
