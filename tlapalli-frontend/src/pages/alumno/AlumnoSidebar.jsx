import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Palette,
  CreditCard,
  ClipboardList,
  User,
  LogOut,
  X,
  HeartHandshake,
} from 'lucide-react';

function AlumnoSidebar({ isOpen, onClose, alumno, onLogout }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-violet-400 border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
        : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-black/80 lg:bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col p-6 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white">Mi Panel</span>
              <span className="text-[10px] text-violet-400 font-bold tracking-[0.2em] uppercase leading-none">Alumno</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          <NavLink to="/alumno/dashboard" onClick={onClose} className={linkClass}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Inicio</span>
          </NavLink>
          <NavLink to="/alumno/talleres" onClick={onClose} className={linkClass}>
            <Palette size={20} />
            <span className="font-medium">Mis Talleres</span>
          </NavLink>
          <NavLink to="/alumno/pagos" onClick={onClose} className={linkClass}>
            <CreditCard size={20} />
            <span className="font-medium">Mis Pagos</span>
          </NavLink>
          <NavLink to="/alumno/asistencias" onClick={onClose} className={linkClass}>
            <ClipboardList size={20} />
            <span className="font-medium">Mi Asistencia</span>
          </NavLink>
          <NavLink to="/alumno/servicio-social" onClick={onClose} className={linkClass}>
            <HeartHandshake size={20} />
            <span className="font-medium">Servicio Social</span>
          </NavLink>
        </nav>

        <div className="border-t border-white/10 pt-4 mt-4">
          <button
            onClick={() => { navigate('/alumno/perfil'); onClose(); }}
            className="w-full flex items-center gap-3 mb-3 px-1 hover:bg-white/5 rounded-2xl py-2 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-neutral-900 flex items-center justify-center">
                <User size={20} className="text-white/80" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white/90 truncate group-hover:text-violet-400 transition-colors">{alumno?.nombre || alumno?.email}</span>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Alumno</span>
            </div>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-600/20 hover:text-red-400 text-white/50 py-3 rounded-2xl border border-white/5 transition-all duration-300 font-semibold"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export default AlumnoSidebar;
