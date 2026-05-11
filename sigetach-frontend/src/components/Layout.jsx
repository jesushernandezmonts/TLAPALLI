import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Search } from 'lucide-react';

function Layout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-transparent text-white font-['Outfit']">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/5 border-b border-white/10 flex items-center justify-between px-8 backdrop-blur-xl">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Buscar alumnos, talleres..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-white/60 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border border-black"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-white/90 leading-none">{user?.nombre || user?.email}</span>
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider mt-1">{user?.rol}</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 p-[2px] shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-neutral-900 flex items-center justify-center overflow-hidden">
                  <User size={24} className="text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
