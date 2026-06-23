import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AlumnoSidebar from './AlumnoSidebar';
import { Menu } from 'lucide-react';
import api from '../../services/api';
import { clearAccessToken } from '../../services/api';

function AlumnoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { alumno } = useOutletContext();

  const handleLogout = async () => {
    try {
      await api.post('/auth/alumno/logout');
    } catch (err) {}
    clearAccessToken();
    navigate('/alumno/login');
  };

  return (
    <div className="flex h-screen bg-transparent text-white font-['Outfit'] overflow-hidden">
      <AlumnoSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        alumno={alumno}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Botón flotante para móvil (igual al admin) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all shadow-2xl"
        >
          <Menu size={24} />
        </button>
        <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ alumno }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AlumnoLayout;
