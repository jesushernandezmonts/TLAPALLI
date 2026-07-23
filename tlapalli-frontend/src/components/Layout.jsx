import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TeacherTour from './TeacherTour';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Search, Menu, HelpCircle } from 'lucide-react';

function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-transparent text-white font-['Outfit'] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Tour interactivo de guía para profesor/instructor */}
      {user && <TeacherTour />}

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Botón flotante para móvil */}
        <div className="lg:hidden fixed top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-3 bg-slate-900 border border-white/15 rounded-2xl text-white/60 hover:text-white transition-all shadow-2xl pointer-events-auto cursor-pointer"
          >
            <Menu size={24} />
          </button>

          <button
            onClick={() => window.dispatchEvent(new Event('open-teacher-tour'))}
            className="p-3 bg-gradient-to-r from-pink-600/30 to-orange-600/30 border border-pink-500/40 rounded-2xl text-pink-300 hover:text-white transition-all shadow-2xl pointer-events-auto cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <HelpCircle size={20} />
            Guía
          </button>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
