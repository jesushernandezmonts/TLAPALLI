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

function AlumnoSidebar({ isOpen, onClose, alumno, onLogout, tipo }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-pink-600/30 to-orange-600/20 text-pink-400 border border-pink-500/30 shadow-[0_0_20px_rgba(219,39,119,0.2)]'
        : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`;

  const tieneTalleres = tipo === 'talleres' || tipo === 'ambos';
  const tieneSS = tipo === 'servicio_social' || tipo === 'ambos';

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
        {/* Header del sidebar */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20">
              <img src="/tlapalli-logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white">TLAPALLI</span>
              <span className="text-[10px] text-pink-500 font-bold tracking-[0.2em] uppercase leading-none">Alumno</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition">
            <X size={20} />
          </button>
        </div>

        {/* Navegación dinámica según el tipo de alumno */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {/* Inicio — siempre visible */}
          <NavLink to="/alumno/dashboard" onClick={onClose} className={linkClass}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Inicio</span>
          </NavLink>

          {/* Mis Talleres — solo si tiene talleres */}
          {tieneTalleres && (
            <NavLink to="/alumno/talleres" onClick={onClose} className={linkClass}>
              <Palette size={20} />
              <span className="font-medium">Mis Talleres</span>
            </NavLink>
          )}

          {/* Mis Pagos — solo si tiene talleres (pagan por taller) */}
          {tieneTalleres && (
            <NavLink to="/alumno/pagos" onClick={onClose} className={linkClass}>
              <CreditCard size={20} />
              <span className="font-medium">Mis Pagos</span>
            </NavLink>
          )}

          {/* Mi Asistencia — solo si tiene talleres */}
          {tieneTalleres && (
            <NavLink to="/alumno/asistencias" onClick={onClose} className={linkClass}>
              <ClipboardList size={20} />
              <span className="font-medium">Mi Asistencia</span>
            </NavLink>
          )}

          {/* Servicio Social — solo si tiene servicio social */}
          {tieneSS && (
            <NavLink to="/alumno/servicio-social" onClick={onClose} className={linkClass}>
              <HeartHandshake size={20} />
              <span className="font-medium">Servicio Social</span>
            </NavLink>
          )}
        </nav>

        {/* Perfil y logout */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <NavLink to="/alumno/perfil" onClick={onClose}
            className="w-full flex items-center gap-3 mb-3 px-1 hover:bg-white/5 rounded-2xl py-2 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-neutral-900 flex items-center justify-center">
                <User size={20} className="text-white/80" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white/90 truncate group-hover:text-pink-400 transition-colors">{alumno?.nombre || alumno?.email}</span>
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Alumno</span>
            </div>
          </NavLink>
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
