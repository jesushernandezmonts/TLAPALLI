import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AlumnoSidebar from './AlumnoSidebar';
import { Menu, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { clearAccessToken } from '../../services/api';

function AlumnoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { alumno } = useOutletContext();
  const [tipo, setTipo] = useState(null);
  const [loadingTipo, setLoadingTipo] = useState(true);

  useEffect(() => {
    const fetchTipo = async () => {
      try {
        const { data } = await api.get('/alumnos/me/tipo');
        setTipo(data.tipo);
      } catch (err) {
        console.error('Error fetching tipo alumno', err);
        setTipo('ambos'); // fallback seguro
      } finally {
        setLoadingTipo(false);
      }
    };
    fetchTipo();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/alumno/logout');
    } catch (err) {}
    clearAccessToken();
    navigate('/alumno/login');
  };

  if (loadingTipo) {
    return (
      <div className="flex h-screen bg-transparent text-white font-['Outfit'] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent text-white font-['Outfit'] overflow-hidden">
      <AlumnoSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        alumno={alumno}
        onLogout={handleLogout}
        tipo={tipo}
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-30 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all shadow-2xl"
        >
          <Menu size={24} />
        </button>
        <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ alumno, tipo }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AlumnoLayout;
