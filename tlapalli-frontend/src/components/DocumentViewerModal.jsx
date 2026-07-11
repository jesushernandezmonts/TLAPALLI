import { createPortal } from 'react-dom';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

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
  if (!isOpen || !url) return null;

  const isPdf = url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('pdf') || url.toLowerCase().includes('cv') || url.toLowerCase().includes('temario');
  const displayTitle = cleanTitle(title);

  // Agrega parámetros para ocultar la barra lateral de miniaturas (navpanes=0) 
  // y ajustar el PDF al ancho de la pantalla (view=FitH) para que no se vea pequeño
  const iframeSrc = isPdf 
    ? (url.includes('#') ? url : `${url}#view=FitH&navpanes=0`)
    : url;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = displayTitle || 'documento';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Usamos createPortal para renderizar el modal en el body directamente.
  // Esto evita que quede atrapado en el contexto de CSS, z-index o bordes de otros modales padres.
  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center p-2 sm:p-4">
      {/* Overlay oscuro de fondo */}
      <div 
        className="absolute inset-0 bg-black/85  transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Contenedor del Modal - Color oscuro unificado (estilo lector de PDFs) para que sea uniforme */}
      <div className="relative w-full max-w-4xl h-[82vh] flex flex-col bg-[#202124] border border-white/15 rounded-2xl shadow-2xl text-white overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera - Color unificado con el fondo de herramientas de PDF */}
        <div className="flex justify-between items-center px-6 py-4.5 bg-[#202124] border-b border-white/15 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileText size={20} className="text-pink-400 shrink-0" />
            <h3 className="text-sm sm:text-base md:text-lg font-black text-white/90 truncate pr-4">
              {displayTitle || 'Visualización de Documento'}
            </h3>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* Botón de descargar */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-pink-600/10 text-pink-400 hover:bg-pink-600/25 border border-pink-500/15 hover:border-pink-500/30 transition cursor-pointer select-none"
              title="Descargar documento"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            {/* Botón de abrir en pestaña nueva */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-slate-800/80 text-white/70 hover:bg-slate-800/90 border border-white/15 hover:border-white/20 transition cursor-pointer select-none"
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
        
        {/* Área del Contenido - Sin márgenes para integrarse perfectamente. Redondeado inferior para consistencia */}
        <div className="flex-1 bg-[#202124] overflow-hidden flex items-center justify-center p-0 rounded-b-2xl">
          {isPdf ? (
            <iframe
              src={iframeSrc}
              title={displayTitle}
              className="w-full h-full bg-[#202124] rounded-b-2xl"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4 rounded-b-2xl">
              <img
                src={url}
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
