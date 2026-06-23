import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function AlumnoActivarCuenta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Enlace de activación inválido. No se encontró el token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe tener al menos una mayúscula');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos un número');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/alumno/activar-cuenta', { token, password });
      setSuccess(data.message || 'Cuenta activada exitosamente');
      setTimeout(() => {
        navigate('/alumno/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al activar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertCircle size={48} className="mx-auto text-rose-400 mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Enlace Inválido</h1>
          <p className="text-white/50 mb-6">El enlace de activación es inválido o ya fue usado.</p>
          <Link to="/alumno/login" className="text-violet-400 hover:text-violet-300 font-bold text-sm transition-colors">
            ← Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <span className="text-white font-black text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-black text-white">Activar Cuenta</h1>
          <p className="mt-2 text-white/50 font-medium">Portal del Alumno — TLAPALLI</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-xl space-y-6">
          {error && (
            <div className="bg-rose-950/60 border border-rose-500/30 text-rose-300 text-sm font-bold p-4 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm font-bold p-4 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Nueva Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all pr-12"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-white/30 mt-1">Mínimo 8 caracteres, 1 mayúscula y 1 número</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all pr-12"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Activando cuenta...</>
            ) : success ? (
              <><CheckCircle2 size={18} /> ¡Cuenta activada!</>
            ) : (
              <><CheckCircle2 size={18} /> Activar Cuenta</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AlumnoActivarCuenta;
