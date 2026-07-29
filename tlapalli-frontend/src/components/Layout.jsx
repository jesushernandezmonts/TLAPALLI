import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TeacherTour from './TeacherTour';
import AdminTour from './AdminTour';
import InstallPwaModal from './InstallPwaModal';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Search, Menu, HelpCircle, Bookmark, X } from 'lucide-react';

function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('tlapalli_pwa_banner_dismissed');
    if (!dismissed) {
      setBannerDismissed(false);
    }
  }, []);

  const handleDismissBanner = () => {
    localStorage.setItem('tlapalli_pwa_banner_dismissed', 'true');
    setBannerDismissed(true);
  };

  return (
    <div className="flex h-screen bg-transparent text-white font-['Outfit'] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Tours interactivos según rol del usuario */}
      {user?.rol === 'admin' ? <AdminTour /> : <TeacherTour />}

      {/* Modal para guardar URL / Instalar PWA */}
      <InstallPwaModal isOpen={pwaModalOpen} onClose={() => setPwaModalOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Barra superior de escritorio / Botones flotantes móviles */}
        <div className="fixed top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-none lg:static lg:p-6 lg:pb-0 lg:flex lg:justify-end lg:gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-3 bg-slate-900 border border-white/15 rounded-2xl text-white/60 hover:text-white transition-all shadow-2xl pointer-events-auto cursor-pointer"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setPwaModalOpen(true)}
              className="p-3 lg:px-4 lg:py-2.5 bg-slate-900/90 border border-pink-500/30 hover:border-pink-500/60 rounded-2xl text-pink-300 hover:text-white transition-all shadow-xl cursor-pointer flex items-center gap-2 text-xs font-bold backdrop-blur-md"
              title="Guardar enlace / Instalar App"
            >
              <Bookmark size={18} className="text-pink-400" />
              <span className="hidden sm:inline">Guardar App / URL</span>
            </button>

            <button
              onClick={() => {
                if (user?.rol === 'admin') {
                  window.dispatchEvent(new Event('open-admin-tour'));
                } else {
                  window.dispatchEvent(new Event('open-teacher-tour'));
                }
              }}
              className="p-3 lg:px-4 lg:py-2.5 bg-gradient-to-r from-pink-600/30 to-orange-600/30 border border-pink-500/40 rounded-2xl text-pink-300 hover:text-white transition-all shadow-2xl cursor-pointer flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
            >
              <HelpCircle size={18} />
              Guía
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 lg:pt-4">
          <div className="max-w-7xl mx-auto">
            {/* Banner recordatorio para profesores y usuarios */}
            {!bannerDismissed && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-pink-950/40 to-slate-900/90 border border-pink-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-['Outfit'] backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-pink-500/20 rounded-xl text-pink-400 border border-pink-500/30 shrink-0">
                    <Bookmark size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-pink-200">📌 ¿Cómo volver a entrar a TLAPALLI todos los días?</p>
                    <p className="text-xs text-slate-300">Guarda esta página en tus Marcadores (⭐) o instálala como aplicación en tu teléfono celular o computadora.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => setPwaModalOpen(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Bookmark size={14} /> Guardar / Instalar
                  </button>
                  <button
                    onClick={handleDismissBanner}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl cursor-pointer transition-all"
                    title="Cerrar aviso"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;


