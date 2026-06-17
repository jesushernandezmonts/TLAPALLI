import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, UserCheck, Lock, Mail, Eye, EyeOff } from 'lucide-react';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
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

  const handleCreatePassword = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      setSaving(true);
      await api.post('/auth/activate-account', { token, password });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al activar la cuenta');
    } finally {
      setSaving(false);
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
              <p className="text-white/70 text-sm mb-6 leading-relaxed">{error}</p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-bold transition-colors"
              >
                Volver al inicio de sesión →
              </Link>
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
              >
                <UserCheck className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-4">¡Cuenta Activada!</h2>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Tu contraseña ha sido creada. Ya puedes iniciar sesión con tu correo y contraseña.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-2xl font-black text-white transition-all"
              >
                Ir a Iniciar Sesión
              </motion.button>
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

              {/* Email registrado */}
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center mb-6">
                <span className="text-xs text-white/40 block mb-1">Correo registrado:</span>
                <span className="text-sm font-semibold text-pink-300">{profesor?.email}</span>
              </div>

              {/* Tabs: Crear Contraseña / Google */}
              <div className="space-y-4">
                {/* Opción 1: Crear Contraseña */}
                <form onSubmit={handleCreatePassword} className="space-y-4">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Lock size={16} className="text-pink-400" /> Crear tu contraseña
                  </h3>

                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña (mínimo 8 caracteres)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirmar contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-all"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={saving || !password || !confirmPassword}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 rounded-2xl font-black text-white transition-all"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Activando...
                      </>
                    ) : (
                      'Activar Cuenta'
                    )}
                  </motion.button>
                </form>

                {/* Separador */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative bg-transparent px-4 text-xs text-white/30 font-bold">O también</span>
                </div>

                {/* Opción 2: Vincular Google */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLinkGoogle}
                  className="w-full flex items-center justify-center gap-3 h-14 bg-white rounded-2xl font-black text-slate-900 hover:bg-slate-100 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] group"
                >
                  <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  Vincular con Google
                </motion.button>
              </div>

              <p className="text-[10px] text-center text-white/30 mt-6">
                Elige crear contraseña o vincula tu cuenta de Google.
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
