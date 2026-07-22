import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import api from '../services/api';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Palette, 
  CreditCard, 
  ClipboardList,
  ClipboardCheck,
  LogOut,
  User,
  X,
  BarChart3,
  HeartHandshake,
  MapPin
} from 'lucide-react';

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-to-r from-pink-600/30 to-orange-600/20 text-pink-400 border border-pink-500/30 shadow-[0_0_20px_rgba(219,39,119,0.2)]' 
        : 'text-white/60 hover:bg-slate-800/80 hover:text-white'
    }`;

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900  z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 lg:bg-slate-900/95  border-r border-white/15 flex flex-col p-6 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20">
              <img src="/tlapalli-logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white">TLAPALLI</span>
              <span className="text-[10px] text-pink-500 font-bold tracking-[0.2em] uppercase leading-none">Management</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        {/* Menú según rol */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {user?.rol === 'admin' ? (
            <>
              <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
                <LayoutDashboard size={20} />
                <span className="font-medium">Dashboard</span>
              </NavLink>
              <NavLink to="/alumnos" onClick={onClose} className={linkClass}>
                <Users size={20} />
                <span className="font-medium">Alumnos</span>
              </NavLink>
              <NavLink to="/instructores" onClick={onClose} className={linkClass}>
                <UserSquare2 size={20} />
                <span className="font-medium">Instructores</span>
              </NavLink>
              <NavLink to="/talleres" onClick={onClose} className={linkClass}>
                <Palette size={20} />
                <span className="font-medium">Talleres</span>
              </NavLink>
              <NavLink to="/asistencia-admin" onClick={onClose} className={linkClass}>
                <ClipboardCheck size={20} />
                <span className="font-medium">Asistencias</span>
              </NavLink>
              <NavLink to="/reportes" onClick={onClose} className={linkClass}>
                <BarChart3 size={20} />
                <span className="font-medium">Reportes</span>
              </NavLink>
              <NavLink to="/mapeo" onClick={onClose} className={linkClass}>
                <MapPin size={20} />
                <span className="font-medium">Mapeo</span>
              </NavLink>
              <NavLink to="/servicio-social" onClick={onClose} className={linkClass}>
                <HeartHandshake size={20} />
                <span className="font-medium">Servicio Social</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/mis-grupos" onClick={onClose} className={linkClass}>
                <LayoutDashboard size={20} />
                <span className="font-medium">Mis Grupos</span>
              </NavLink>
              <NavLink to="/asistencia" onClick={onClose} className={linkClass}>
                <ClipboardList size={20} />
                <span className="font-medium">Pasar Lista</span>
              </NavLink>
              <NavLink to="/pagos" onClick={onClose} className={linkClass}>
                <CreditCard size={20} />
                <span className="font-medium">Pagos</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Información del usuario y logout */}
        <div className="border-t border-white/15 pt-4 mt-4">
          <button
            onClick={() => { navigate('/mi-perfil'); onClose(); }}
            className="w-full flex items-center gap-3 mb-3 px-1 hover:bg-slate-800/80 rounded-2xl py-2 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-neutral-900 flex items-center justify-center overflow-hidden">
                {user?.fotoUrl && !photoError ? (
                  <img
                    src={user.fotoUrl}
                    alt={user?.nombre}
                    className="w-full h-full object-cover"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <User size={20} className="text-white/80" />
                )}
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white/90 truncate group-hover:text-pink-400 transition-colors">{user?.nombre || user?.email}</span>
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">{user?.rol}</span>
            </div>
          </button>
          <button 
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-red-600/20 hover:text-red-400 text-white/50 py-3 rounded-2xl border border-white/15 transition-all duration-300 font-semibold"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <ConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={logout}
        title="¿Cerrar sesión?"
        message="Tu sesión actual se cerrará y tendrás que iniciar sesión nuevamente para continuar. ¿Deseas salir?"
        confirmText="Sí, cerrar"
        cancelText="Cancelar"
      />
    </>
  );
}

export default Sidebar;
