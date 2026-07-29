import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Download, Smartphone, Monitor, Copy, Check, X, ExternalLink } from 'lucide-react';

export default function InstallPwaModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop'); // 'android', 'ios', 'desktop'

  useEffect(() => {
    // Detectar dispositivo
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios');
    } else if (/android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Capturar evento PWA beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl text-white font-['Outfit'] overflow-hidden"
        >
          {/* Fondo decorativo con gradiente */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Encabezado */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">¿Cómo volver a entrar a TLAPALLI?</h2>
              <p className="text-xs text-slate-400">Guarda el acceso en tu celular o computadora</p>
            </div>
          </div>

          {/* Opción 1: Instalación directa PWA (Si está disponible) */}
          {deferredPrompt && !isInstalled && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 border border-pink-500/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm text-pink-300 flex items-center gap-1.5">
                    <Download size={16} /> Instala la App en 1 Clic
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Crea un ícono en la pantalla de tu dispositivo para abrir el sistema directamente.
                  </p>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  Instalar App
                </button>
              </div>
            </div>
          )}

          {isInstalled && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check size={18} />
              <span>¡La aplicación ya está instalada en tu dispositivo!</span>
            </div>
          )}

          {/* Opción 2: Instrucciones según el dispositivo */}
          <div className="space-y-4 mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Instrucciones para tu dispositivo ({deviceType === 'ios' ? 'iPhone / iPad' : deviceType === 'android' ? 'Android' : 'Computadora'})
            </h3>

            {deviceType === 'ios' && (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Smartphone size={16} className="text-pink-400" />
                  <span>En Safari (iPhone / iPad):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>Toca el botón <strong>Compartir</strong> (ícono de rectángulo con flecha 📤 abajo).</li>
                  <li>Desplázate hacia abajo y selecciona <strong>"Agregar a inicio"</strong> ➕.</li>
                  <li>¡Listo! Ya tendrás el ícono de TLAPALLI en tus aplicaciones.</li>
                </ol>
              </div>
            )}

            {deviceType === 'android' && (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Smartphone size={16} className="text-emerald-400" />
                  <span>En Chrome / Navegador (Android):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>Toca el menú de <strong>3 puntos (⋮)</strong> en la esquina superior derecha.</li>
                  <li>Selecciona <strong>"Agregar a la pantalla principal"</strong> o <strong>"Instalar aplicación"</strong>.</li>
                  <li>Toca <strong>Agregar</strong> para confirmar.</li>
                </ol>
              </div>
            )}

            {deviceType === 'desktop' && (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Monitor size={16} className="text-blue-400" />
                  <span>En tu computadora (Chrome / Edge / Firefox):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>Haz clic en el ícono de <strong>Estrella (⭐)</strong> en la barra de direcciones para guardar en <strong>Favoritos</strong>.</li>
                  <li>O presiona las teclas <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-white font-mono">Ctrl + D</kbd> (en Windows) o <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-white font-mono">Cmd + D</kbd> (en Mac).</li>
                </ol>
              </div>
            )}
          </div>

          {/* Copiar enlace directo */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden text-xs text-slate-400">
              <ExternalLink size={14} className="shrink-0 text-slate-500" />
              <span className="truncate font-mono">{window.location.origin}</span>
            </div>
            <button
              onClick={copyUrlToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>

          {/* Botón Entendido */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              ¡Entendido!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
