import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import api from '../services/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Password strength indicator logic
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Débil', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Regular', color: 'bg-yellow-500' };
    if (score === 3) return { level: 3, label: 'Buena', color: 'bg-blue-500' };
    return { level: 4, label: 'Fuerte', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    if (password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      return setError('La contraseña debe tener al menos una letra mayúscula');
    }

    if (!/[0-9]/.test(password)) {
      return setError('La contraseña debe tener al menos un número');
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
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
        <div className="bg-slate-800/90 border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="mb-8 text-left">
            <Link to="/login" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium mb-6">
              <ArrowLeft size={16} />
              Volver al login
            </Link>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Nueva Contraseña</h1>
            <p className="text-white/60 text-sm">Crea una contraseña segura. Este enlace expira en <span className="text-pink-400 font-semibold">15 minutos</span>.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password requirements info */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-white/15 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-white/50 space-y-1 text-left">
                    <p className="font-semibold text-white/70">Tu contraseña debe tener:</p>
                    <ul className="space-y-0.5 ml-2">
                      <li className={password.length >= 8 ? 'text-emerald-400' : ''}>• Mínimo 8 caracteres</li>
                      <li className={/[A-Z]/.test(password) ? 'text-emerald-400' : ''}>• Al menos una letra mayúscula</li>
                      <li className={/[0-9]/.test(password) ? 'text-emerald-400' : ''}>• Al menos un número</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-white/80 ml-1 flex">Nueva Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    className="w-full bg-slate-800/90 border border-white/20 rounded-2xl px-12 py-4 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-slate-800/95 transition-all"
                    type={showPassword ? "text" : "password"}
                    placeholder="Elige una contraseña segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 px-1 text-left"
                  >
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.level ? strength.color : 'bg-slate-800/90'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${
                      strength.level <= 1 ? 'text-red-400' :
                      strength.level === 2 ? 'text-yellow-400' :
                      strength.level === 3 ? 'text-blue-400' : 'text-emerald-400'
                    }`}>
                      {strength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-white/80 ml-1 flex">Confirmar Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    className="w-full bg-slate-800/90 border border-white/20 rounded-2xl px-12 py-4 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-slate-800/95 transition-all"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-left"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                type="submit"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Restablecer Contraseña"}
              </motion.button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¡Contraseña restablecida!</h2>
              <p className="text-white/60 text-sm mb-4">
                Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tus nuevas credenciales. Redirigiendo...
              </p>
              <Link to="/login" className="text-pink-400 hover:text-pink-300 font-bold transition-colors">
                Ir al inicio de sesión ahora
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
