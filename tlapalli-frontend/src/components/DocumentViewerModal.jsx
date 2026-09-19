import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, ExternalLink, Loader2, RotateCw } from 'lucide-react';
import api from '../services/api';

const cleanTitle = (str) => {
  if (!str) return '';
  try {
    // Resuelve problemas comunes de codificación UTF-8 como "GestiÃ³n" -> "Gestión"
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
};

function DocumentViewerModal({ isOpen, onClose, url, title }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [useGoogleDocs, setUseGoogleDocs] = useState(false);

  const lowerUrl = (url || '').toLowerCase();

  // Detectar si es una imagen (extensiones comunes)
  const isImage = lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i);

  // Detectar si es PDF
  const isPdf = !isImage && (
    lowerUrl.endsWith('.pdf') ||
    lowerUrl.includes('.pdf') ||
    lowerUrl.includes('/pdf')
  );

  useEffect(() => {
    let active = true;
    let createdUrl = null;

    if (isOpen && url && isPdf) {
      setLoading(true);
      setError(false);
      setBlobUrl(null);

      // Usar api de axios con Token para endpoints del backend, o fetch directo si es URL externa de Cloudinary
      const isExternalUrl = url.startsWith('http') && url.includes('cloudinary.com');

      const requestPromise = isExternalUrl
        ? fetch(url).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
        : api.get(url, { responseType: 'blob' }).then((res) => res.data);

      requestPromise
        .then((blobData) => {
          if (!active) return;
          const pdfBlob = new Blob([blobData], { type: 'application/pdf' });
          createdUrl = URL.createObjectURL(pdfBlob);
          setBlobUrl(createdUrl);
          setLoading(false);
        })
        .catch((err) => {
          console.warn('Falló la carga en memoria de Blob, usando URL directa:', err);
          if (active) {
            // Fallback elegante: si falla el blob o devuelve 401, usar la URL directa directamente
            setBlobUrl(url);
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, url, isPdf]);

  if (!isOpen || !url) return null;

  const displayTitle = cleanTitle(title);
  const rawUrl = url;

  const activePdfUrl = useGoogleDocs
    ? `https://docs.google.com/gview?url=${encodeURIComponent(rawUrl)}&embedded=true`
    : (blobUrl ? `${blobUrl}#view=FitH&navpanes=0` : `${rawUrl}#view=FitH&navpanes=0`);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = rawUrl;
    link.download = displayTitle || 'documento';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Usamos createPortal para renderizar el modal en el body directamente.
  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center p-2 sm:p-4">
      {/* Overlay oscuro de fondo */}
      <div 
        className="absolute inset-0 bg-black/85 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col bg-[#202124] border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 bg-[#202124] border-b border-white/15 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileText size={20} className="text-pink-400 shrink-0" />
            <h3 className="text-sm sm:text-base md:text-lg font-black text-white/90 truncate pr-2">
              {displayTitle || 'Visualización de Documento'}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Alternar Visor Google Docs si se desea */}
            {isPdf && (
              <button
                onClick={() => setUseGoogleDocs(!useGoogleDocs)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none border ${
                  useGoogleDocs 
                    ? 'bg-purple-600/30 text-purple-300 border-purple-500/40 hover:bg-purple-600/40' 
                    : 'bg-slate-800 text-white/70 border-white/15 hover:bg-slate-700'
                }`}
                title="Cambiar a visor secundario de Google"
              >
                <RotateCw size={14} />
                <span className="hidden sm:inline">{useGoogleDocs ? 'Visor Google' : 'Visor Nativo'}</span>
              </button>
            )}

            {/* Botón de descargar */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 sm:px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-pink-600/10 text-pink-400 hover:bg-pink-600/25 border border-pink-500/15 hover:border-pink-500/30 transition cursor-pointer select-none"
              title="Descargar documento"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            {/* Botón de abrir en pestaña nueva */}
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 sm:px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-slate-800/80 text-white/70 hover:bg-slate-800/90 border border-white/15 hover:border-white/20 transition cursor-pointer select-none"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Abrir</span>
            </a>

            {/* Divisor */}
            <div className="h-6 w-px bg-slate-800/90 mx-1 hidden sm:block" />

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="p-2.5 text-white/60 hover:text-white hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-white/15 transition cursor-pointer"
              title="Cerrar visor"
            >
              <X size={22} />
            </button>
          </div>
        </div>
        
        {/* Área del Contenido */}
        <div className="flex-1 bg-[#202124] overflow-hidden flex items-center justify-center p-0 rounded-b-2xl relative">
          {isPdf ? (
            loading ? (
              <div className="flex flex-col items-center gap-3 text-white/70">
                <Loader2 size={36} className="animate-spin text-pink-500" />
                <p className="text-sm font-semibold tracking-wide">Cargando PDF...</p>
              </div>
            ) : error && !useGoogleDocs ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-white/80 gap-4 max-w-md">
                <FileText size={48} className="text-pink-400" />
                <p className="text-sm font-medium leading-relaxed">
                  El navegador requiere abrir el PDF externamente o mediante el visor auxiliar.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setUseGoogleDocs(true)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    Usar Visor Auxiliar
                  </button>
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    Abrir PDF en Nueva Pestaña
                  </a>
                </div>
              </div>
            ) : (
              <object
                data={activePdfUrl}
                type="application/pdf"
                className="w-full h-full bg-[#202124] rounded-b-2xl"
              >
                <iframe
                  src={activePdfUrl}
                  title={displayTitle}
                  className="w-full h-full bg-[#202124] rounded-b-2xl"
                  style={{ border: 'none' }}
                />
              </object>
            )
          ) : (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4 rounded-b-2xl">
              <img
                src={rawUrl}
                alt={displayTitle}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DocumentViewerModal;
