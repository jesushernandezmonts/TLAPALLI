import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Palette, 
  CreditCard, 
  ClipboardList, 
  BookOpen,
  LogOut,
  User
} from 'lucide-react';

function Sidebar() {
  const { user, logout } = useAuth();
  
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-to-r from-pink-600/30 to-orange-600/20 text-pink-400 border border-pink-500/30 shadow-[0_0_20px_rgba(219,39,119,0.2)]' 
        : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20">
          <img src="/tlapalli-logo.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-white">TLAPALLI</span>
          <span className="text-[10px] text-pink-500 font-bold tracking-[0.2em] uppercase leading-none">Management</span>
        </div>
      </div>
      
      {/* Menú según rol */}
      <nav className="flex flex-col gap-2 flex-1">
        {user?.rol === 'admin' ? (
          <>
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </NavLink>
            <NavLink to="/alumnos" className={linkClass}>
              <Users size={20} />
              <span className="font-medium">Alumnos</span>
            </NavLink>
            <NavLink to="/instructores" className={linkClass}>
              <UserSquare2 size={20} />
              <span className="font-medium">Instructores</span>
            </NavLink>
            <NavLink to="/talleres" className={linkClass}>
              <Palette size={20} />
              <span className="font-medium">Talleres</span>
            </NavLink>
            <NavLink to="/inscripciones" className={linkClass}>
              <BookOpen size={20} />
              <span className="font-medium">Inscripciones</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/mis-grupos" className={linkClass}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Mis Grupos</span>
            </NavLink>
            <NavLink to="/asistencia" className={linkClass}>
              <ClipboardList size={20} />
              <span className="font-medium">Pasar Lista</span>
            </NavLink>
            <NavLink to="/pagos" className={linkClass}>
              <CreditCard size={20} />
              <span className="font-medium">Pagos</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Información del usuario y logout */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 p-[2px] flex-shrink-0">
            <div className="w-full h-full rounded-[10px] bg-neutral-900 flex items-center justify-center">
              <User size={16} className="text-white/80" />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white/90 truncate">{user?.nombre || user?.email}</span>
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">{user?.rol}</span>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-600/20 hover:text-red-400 text-white/50 py-3 rounded-2xl border border-white/5 transition-all duration-300 font-semibold"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
