import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Search, Menu } from 'lucide-react';

function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-transparent text-white font-['Outfit'] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Botón flotante para móvil (reemplaza al header) */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 p-3 bg-slate-900  border border-white/15 rounded-2xl text-white/60 hover:text-white transition-all shadow-2xl"
        >
          <Menu size={24} />
        </button>

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
