import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { setAccessToken } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

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
      const { data } = await api.post('/auth/alumno/login', { email, password });
      setAccessToken(data.accessToken);
      navigate('/alumno/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <span className="text-white font-black text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-black text-white">Portal del Alumno</h1>
          <p className="mt-2 text-white/50 font-medium">TLAPALLI — Centro Cultural Huamantla</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-xl space-y-6">
          {error && (
            <div className="bg-rose-950/60 border border-rose-500/30 text-rose-300 text-sm font-bold p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Iniciando sesión...</>
            ) : (
              <><LogIn size={18} /> Iniciar Sesión</>
            )}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-white/40 hover:text-violet-400 transition-colors font-medium">
              ← Volver al inicio de sesión principal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AlumnoLogin;
