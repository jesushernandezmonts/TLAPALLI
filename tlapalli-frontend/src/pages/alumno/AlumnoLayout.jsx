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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-950 to-slate-900 flex">
      <AlumnoSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        alumno={alumno}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center gap-4 p-4 border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white p-2">
            <Menu size={24} />
          </button>
          <span className="text-lg font-black text-white">TLAPALLI</span>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet context={{ alumno }} />
        </div>
      </main>
    </div>
  );
}

export default AlumnoLayout;
