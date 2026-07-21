import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, TrendingUp, Users, BookOpen, Calendar,
  Download, Loader2, AlertCircle, RefreshCw, CheckCircle2, Trash2,
  ChevronLeft, ChevronRight, Search, Filter, X, CalendarDays, CalendarX,
  Printer, Database
} from 'lucide-react';
import api from '../services/api';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import BackupsModal from '../components/BackupsModal';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const getFullUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};

const fmt  = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
const fmtD = (d) => new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtDL = (d) => new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
const hoy  = () => new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

/* ─── config de tarjetas ───────────────────────────────────────────────────── */
const REPORTS = [
  {
    id: 'general',
    title: 'Reporte General',
    subtitle: 'Administración completa del centro',
    icon: FileText,
    gradient: 'from-pink-600 to-rose-700',
    ring: 'ring-pink-500/30',
    glow: '0 0 30px rgba(236,72,153,0.25)',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    desc: 'Resumen ejecutivo con todos los KPIs: alumnos, talleres, instructores e ingresos totales.',
  },
  {
    id: 'financiero',
    title: 'Reporte Financiero',
    subtitle: 'Ingresos detallados y métodos de pago',
    icon: TrendingUp,
    gradient: 'from-emerald-600 to-teal-700',
    ring: 'ring-emerald-500/30',
    glow: '0 0 30px rgba(16,185,129,0.25)',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    desc: 'Desglose de ingresos por mes y método de pago. Historial completo de transacciones.',
  },
  {
    id: 'alumnos',
    title: 'Reporte de Alumnos',
    subtitle: 'Inscritos por taller y estatus',
    icon: Users,
    gradient: 'from-violet-600 to-purple-700',
    ring: 'ring-violet-500/30',
    glow: '0 0 30px rgba(139,92,246,0.25)',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    desc: 'Lista completa de alumnos, talleres en que participan y estatus de inscripción.',
  },
  {
    id: 'talleres',
    title: 'Talleres e Instructores',
    subtitle: 'Capacidad, costos y personal',
    icon: BookOpen,
    gradient: 'from-cyan-600 to-blue-700',
    ring: 'ring-cyan-500/30',
    glow: '0 0 30px rgba(6,182,212,0.25)',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    desc: 'Información de cada taller: cupo, alumnos inscritos, costo mensual e instructor asignado.',
  },
  {
    id: 'actividades',
    title: 'Reporte de Actividades',
    subtitle: 'Eventos y calendario cultural',
    icon: Calendar,
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-500/30',
    glow: '0 0 30px rgba(245,158,11,0.25)',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    desc: 'Registro de actividades culturales internas y externas en Galería, Audioteca y Auditorio.',
  },
];

/* ─── SVG watermark ─────────────────────────────────────────────────────────── */
const Flower = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path d="M 50 42 L 58 50 L 50 58 L 42 50 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="3.5" fill="#D4AF37" />
    <path d="M 50 42 C 45 31, 40 37, 50 25 C 60 37, 55 31, 50 42 Z" fill="currentColor" />
    <circle cx="50" cy="20" r="2.5" fill="#D4AF37" />
    <path d="M 50 58 C 45 69, 40 63, 50 75 C 60 63, 55 69, 50 58 Z" fill="currentColor" />
    <circle cx="50" cy="80" r="2.5" fill="#D4AF37" />
    <path d="M 58 50 C 69 45, 63 40, 75 50 C 63 60, 69 55, 58 50 Z" fill="currentColor" />
    <circle cx="80" cy="50" r="2.5" fill="#D4AF37" />
    <path d="M 42 50 C 31 45, 37 40, 25 50 C 37 60, 31 55, 42 50 Z" fill="currentColor" />
    <circle cx="20" cy="50" r="2.5" fill="#D4AF37" />
    <path d="M 56 44 L 66 34 M 62 34 L 66 34 L 66 38" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 44 44 L 34 34 M 38 34 L 34 34 L 34 38" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 56 56 L 66 66 M 62 66 L 66 66 L 66 62" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 44 56 L 34 66 M 38 66 L 34 66 L 34 62" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/* ─── cabecera oficial reutilizable ──────────────────────────────────────────── */
const PrintHeader = ({ titulo, asunto }) => (
  <>
    <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
      <div className="text-center flex flex-col items-center select-none">
        <Flower className="w-10 h-10 text-[#801D38]" />
        <div className="text-[#801D38] font-black text-sm tracking-[0.2em] leading-none mt-1">TLAXCALA</div>
        <div className="text-[6px] font-black text-[#D4AF37] tracking-[0.1em]">UNA NUEVA HISTORIA</div>
        <div className="text-[5px] font-bold text-neutral-400 tracking-[0.2em]">2021 - 2027</div>
      </div>
      <div className="text-center flex flex-col items-center pt-2">
        <p className="font-black text-neutral-900 text-sm uppercase tracking-tight">{titulo}</p>
        <p className="text-[10px] text-neutral-500">Centro Cultural Huamantla</p>
      </div>
      <div className="text-right text-[9px] text-neutral-600 leading-normal font-sans">
        <p className="font-bold text-neutral-900 text-[11px] uppercase tracking-tight">Centro Cultural Huamantla</p>
        <p>Parque Juárez No.14</p>
        <p>Tel: 2 47 47 2 13 11</p>
        <p className="font-semibold text-[#801D38]">Área: Coordinación</p>
      </div>
    </div>
    <div className="text-right text-[10px] space-y-0.5 pt-1.5 font-sans">
      <p className="font-bold text-neutral-900">Asunto: <span className="font-medium text-neutral-700">{asunto}</span></p>
      <p className="text-neutral-500">Huamantla, Tlax., a {hoy()}</p>
    </div>
    <div className="text-xs pt-3 font-sans">
      <p className="font-black text-neutral-900 uppercase">C. COORDINADOR DEL CENTRO CULTURAL HUAMANTLA</p>
      <p className="font-black text-[#801D38] tracking-[0.2em] mt-1">P R E S E N T E .</p>
    </div>
  </>
);
const PrintFooter = () => (
  <div className="border-t border-neutral-200 pt-3 flex justify-between items-center text-[8px] text-neutral-400 z-10 font-sans">
    <p>c. c. p. Archivo / Centro Cultural Huamantla</p>
    <div className="flex items-center gap-2 select-none">
      <div className="text-left leading-none">
        <span className="font-black text-[12px] text-[#801D38] tracking-tighter">SC</span>
        <span className="text-[6px] font-bold block text-neutral-500 tracking-tight">SECRETARÍA DE CULTURA</span>
      </div>
      <Flower className="w-5 h-5 text-[#801D38]" />
    </div>
  </div>
);

const PrintPage = ({ children }) => (
  <div className="bg-white text-neutral-800 font-sans text-[11px]">
    {/* Top colorful bars */}
    <div className="flex h-1.5 w-full">
      <div className="bg-[#4D8C3E] w-1/3" />
      <div className="bg-[#F29C38] w-1/3" />
      <div className="bg-[#8A244E] w-1/3" />
    </div>

    <div className="p-4 md:p-6 relative bg-white select-text overflow-hidden">
      {/* Faded Watermark in background */}
      <div className="watermark-print absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none select-none z-0">
        <Flower className="w-[300px] h-[300px] text-[#801D38]" />
      </div>
      
      <div className="relative z-10 space-y-3">
        {children}
      </div>

      <PrintFooter />
    </div>
  </div>
);

const PrintSignOff = () => (
  <div className="pt-5 text-center text-[10px] space-y-5 font-sans">
    <p className="font-bold text-neutral-700 uppercase tracking-widest">A t e n t a m e n t e</p>
    <div>
      <p className="font-bold text-neutral-950">Mtro. Manuel de la Vega Moreno</p>
      <p className="text-neutral-500">Coordinador de Centro Cultural Huamantla</p>
    </div>
  </div>
);

const TablaPrint = ({ headers, rows }) => (
  <div className="pt-2">
    <table className="w-full text-left text-[10px] border-collapse border border-neutral-300 font-sans">
      <thead>
        <tr className="bg-[#801D38] text-white font-bold uppercase tracking-wider text-[9px]">
          {headers.map((h, idx) => <th key={idx} className="border border-neutral-300 p-2 text-[8px]">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200">
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="p-8 text-center text-neutral-400 italic">No se encontraron registros.</td></tr>
        ) : rows.map((cells, i) => (
          <tr key={i} className="hover:bg-neutral-50/50">
            {cells.map((c, j) => (
              <td key={j} className={`border border-neutral-300 p-2 ${j === 0 ? 'font-bold text-neutral-900' : 'text-neutral-600'}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ─── MiniCalendar personalizado ────────────────────────────────────────────── */
const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function MiniCalendar({ value, onChange, onClear }) {
  const hoyDate = new Date();
  const [open, setOpen]     = useState(false);
  const [viewYear, setViewYear]   = useState(value ? new Date(value + 'T12:00:00').getFullYear()  : hoyDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? new Date(value + 'T12:00:00').getMonth()     : hoyDate.getMonth());

  // Sincronizar vista al cambiar valor externo
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const primerDia  = new Date(viewYear, viewMonth, 1).getDay();
  const diasMes    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const celdas     = Array.from({ length: primerDia + diasMes }, (_, i) =>
    i < primerDia ? null : i - primerDia + 1
  );

  const seleccionado = value ? new Date(value + 'T12:00:00') : null;

  const esMismoDia = (d) =>
    seleccionado &&
    seleccionado.getFullYear() === viewYear &&
    seleccionado.getMonth()    === viewMonth &&
    seleccionado.getDate()     === d;

  const esHoy = (d) =>
    hoyDate.getFullYear() === viewYear &&
    hoyDate.getMonth()    === viewMonth &&
    hoyDate.getDate()     === d;

  const seleccionar = (d) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMes = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMes = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const labelFecha = seleccionado
    ? seleccionado.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="relative">
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
          value
            ? 'bg-pink-500/15 border-pink-500/40 text-pink-300 hover:bg-pink-500/25'
            : 'bg-slate-800/80 border-white/15 text-white/50 hover:bg-slate-800/90 hover:text-white/80'
        }`}
      >
        <CalendarDays size={15} className={value ? 'text-pink-400' : 'text-white/30'} />
        {value ? (
          <span>{labelFecha}</span>
        ) : (
          <span>Filtrar por fecha</span>
        )}
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onClear())}
            className="ml-1 p-0.5 rounded-full hover:bg-pink-500/30 text-pink-400/70 hover:text-pink-300 transition"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {/* Popup calendario */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay para cerrar */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl shadow-black/50 overflow-hidden"
            >
              {/* Cabecera del mes */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <button
                  onClick={prevMes}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-slate-800/90 transition"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-sm font-black text-white tracking-wide">
                  {MESES[viewMonth]} {viewYear}
                </span>
                <button
                  onClick={nextMes}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-slate-800/90 transition"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="p-3">
                {/* Encabezado días */}
                <div className="grid grid-cols-7 mb-1">
                  {DIAS_SEMANA.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-white/25 uppercase py-1">{d}</div>
                  ))}
                </div>

                {/* Celdas del mes */}
                <div className="grid grid-cols-7 gap-0.5">
                  {celdas.map((d, idx) => (
                    d === null ? (
                      <div key={`empty-${idx}`} />
                    ) : (
                      <button
                        key={d}
                        onClick={() => seleccionar(d)}
                        className={`w-full aspect-square rounded-xl text-[12px] font-bold transition-all duration-150 flex items-center justify-center ${
                          esMismoDia(d)
                            ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30 scale-105'
                            : esHoy(d)
                            ? 'bg-slate-800/90 text-white ring-1 ring-pink-500/40'
                            : 'text-white/60 hover:bg-slate-800/90 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Footer: ir a hoy */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => {
                    const hh = String(hoyDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(hoyDate.getDate()).padStart(2, '0');
                    onChange(`${hoyDate.getFullYear()}-${hh}-${dd}`);
                    setOpen(false);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white/40 hover:text-pink-300 hover:bg-pink-500/10 border border-white/15 hover:border-pink-500/20 transition-all duration-200"
                >
                  Ir a hoy
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── componente principal ────────────────────────────────────────────────── */
export default function Reportes() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';
  const [showBackupsModal, setShowBackupsModal] = useState(false);

  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [printing, setPrinting] = useState(null); // id del reporte activo en print
  const [generating, setGenerating] = useState(null);
  const [done, setDone]         = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [currentPage, setCurrentPage]   = useState(1);
  const [filtroTipo, setFiltroTipo]     = useState('todos');
  const [busqueda, setBusqueda]         = useState('');
  const [fechaFiltro, setFechaFiltro]         = useState('');
  const [previewReport, setPreviewReport]     = useState(null);
  const [downloadingId, setDownloadingId]     = useState(null);
  const itemsPerPage = 5;

  const reportesFiltrados = useMemo(() => {
    return savedReports.filter((r) => {
      const matchTipo    = filtroTipo === 'todos' || r.tipo === filtroTipo;
      const termino      = busqueda.toLowerCase();
      const matchBusqueda = termino === '' ||
        r.nombre.toLowerCase().includes(termino) ||
        (REPORTS.find(rep => rep.id === r.tipo)?.title || '').toLowerCase().includes(termino);

      let matchFecha = true;
      if (fechaFiltro) {
        const fechaReporte = new Date(r.creadoEn);
        const seleccionada = fechaFiltro; // 'YYYY-MM-DD'
        const yy = fechaReporte.getFullYear();
        const mm = String(fechaReporte.getMonth() + 1).padStart(2, '0');
        const dd = String(fechaReporte.getDate()).padStart(2, '0');
        matchFecha = `${yy}-${mm}-${dd}` === seleccionada;
      }

      return matchTipo && matchBusqueda && matchFecha;
    });
  }, [savedReports, filtroTipo, busqueda, fechaFiltro]);

  useEffect(() => {
    const totalPages = Math.ceil(reportesFiltrados.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [reportesFiltrados, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroTipo, busqueda, fechaFiltro]);

  useEffect(() => {
    fetchData();
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    try {
      const { data: reports } = await api.get('/reportes');
      setSavedReports(reports);
    } catch (err) {
      console.error('Error al cargar historial de reportes', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: d } = await api.get('/stats/reportes');
      setData(d);
    } catch {
      setError('No se pudo cargar la información. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (id) => {
    setGenerating(id);
    setPrinting(id);
    await new Promise(r => setTimeout(r, 400)); // esperar render

    const element = document.getElementById('print-section');
    if (!element) {
      console.error('No se encontró el elemento de impresión');
      setGenerating(null);
      setPrinting(null);
      return;
    }

    const prevDisplay = element.style.display;
    element.style.display = 'block';

    const reportTypeTitle = REPORTS.find(r => r.id === id)?.title || 'Reporte';
    const dateStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace(/ /g, '_')
      .replace(/\./g, '')
      .replace(/,/g, '');
    const cleanFileName = `${reportTypeTitle.replace(/ /g, '_')}_${dateStr}.pdf`;

    try {
      // html2canvas-pro soporta oklch y colores modernos de CSS
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Crear PDF con jsPDF
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth  = canvas.width;
      const imgHeight = canvas.height;
      const ratio     = pdfWidth / imgWidth;
      const totalPdfHeight = imgHeight * ratio;

      // Paginar si el contenido supera una página
      let yOffset = 0;
      while (yOffset < totalPdfHeight) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfWidth, totalPdfHeight);
        yOffset += pdfHeight;
      }

      const pdfBlob = pdf.output('blob');

      // Subida al backend
      const formData = new FormData();
      formData.append('archivo', pdfBlob, cleanFileName);
      formData.append('tipo', id);
      formData.append('nombre', cleanFileName.replace('.pdf', '').replace(/_/g, ' '));

      await api.post('/reportes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await fetchSavedReports();
      setDone(id);
    } catch (err) {
      console.error('Error al generar y guardar reporte PDF:', err);
    } finally {
      element.style.display = prevDisplay;
      setGenerating(null);
      setPrinting(null);
      setTimeout(() => setDone(null), 2500);
    }
  };

  const generateAndDownloadPdf = async (tipo, nombreArchivo) => {
    // Mostrar la sección de impresión
    setPrinting(tipo);
    await new Promise(r => setTimeout(r, 600)); // esperar render del DOM

    const element = document.getElementById('print-section');
    if (!element) return;

    // Forzar dimensiones carta correctas para html2canvas
    element.style.display = 'block';
    element.style.position = 'fixed';
    element.style.top = '-9999px';
    element.style.left = '0';
    element.style.width = '816px';   // ancho carta a 96 DPI
    element.style.zIndex = '-1';

    await new Promise(r => setTimeout(r, 200)); // esperar repaint

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 816,
        windowWidth: 816,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio     = pdfWidth / canvas.width;
      const totalPdfH = canvas.height * ratio;
      let yOffset = 0;
      while (yOffset < totalPdfH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfWidth, totalPdfH);
        yOffset += pdfHeight;
      }
      pdf.save(nombreArchivo);
    } catch (err) {
      console.error('Error al generar PDF:', err);
    } finally {
      // Restaurar estilos del elemento
      element.style.display = 'none';
      element.style.position = '';
      element.style.top = '';
      element.style.left = '';
      element.style.width = '';
      element.style.zIndex = '';
      setPrinting(null);
    }
  };

  const handleDownload = async (report) => {
    setDownloadingId(report.id);
    try {
      const dateStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        .replace(/ /g, '_').replace(/\./g, '').replace(/,/g, '');
      const filename = `${report.nombre}_${dateStr}.pdf`;
      await generateAndDownloadPdf(report.tipo, filename);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este reporte del sistema? El archivo PDF se borrará de forma permanente.')) {
      try {
        await api.delete(`/reportes/${id}`);
        fetchSavedReports();
      } catch (err) {
        console.error('Error al eliminar reporte:', err);
      }
    }
  };

  const handleModalPrint = useCallback((tipo) => {
    setPrinting(tipo);
    setPreviewReport(null); // cerrar modal
    setTimeout(() => {
      window.print();
      setPrinting(null);
    }, 500);
  }, []);

  /* ── KPI bar ── */
  const kpis = data ? [
    { label: 'Alumnos',      val: data.resumen.totalAlumnos },
    { label: 'Talleres',     val: data.resumen.totalTalleres },
    { label: 'Instructores', val: data.resumen.totalInstructores },
    { label: 'Ingresos',     val: fmt(data.resumen.ingresosTotales) },
    { label: 'Actividades',  val: data.resumen.totalActividades },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
        <p className="text-white/40 text-sm">Cargando datos de reportes...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="text-white/70">{error}</p>
        <button onClick={fetchData} className="flex items-center gap-2 mx-auto px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl text-white text-sm font-bold transition">
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Reportes
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75 drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Genera y descarga reportes oficiales en PDF
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBackupsModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 border border-indigo-400/30 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <Database size={14} /> Respaldos de BD
            </motion.button>
          )}

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800/90 border border-white/15 text-white/50 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw size={14} /> Actualizar datos
          </button>
        </div>
      </div>

      {/* Modal de Respaldos de Base de Datos para Admin */}
      <BackupsModal
        isOpen={showBackupsModal}
        onClose={() => setShowBackupsModal(false)}
      />

      {/* ── KPI bar ── */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-slate-900/95 border border-white/15 rounded-2xl px-4 py-3 text-center">
              <p className="text-xl font-black text-white">{k.val}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Cards de reportes ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {REPORTS.map((r, i) => {
          const Icon = r.icon;
          const isGen  = generating === r.id;
          const isDone = done === r.id;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02, boxShadow: r.glow }}
              className={`relative bg-slate-900/95 border border-white/15 rounded-3xl p-6 flex flex-col gap-4 overflow-hidden ring-1 ${r.ring} transition-all duration-300`}
            >
              {/* fondo decorativo */}
              <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${r.gradient}`} />

              <div className="flex items-start gap-4 relative">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-white text-base leading-tight">{r.title}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 px-2 py-0.5 rounded-full border inline-block ${r.badge}`}>
                    {r.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-white/50 text-xs leading-relaxed relative">{r.desc}</p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePrint(r.id)}
                disabled={!!generating}
                className={`relative mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${r.gradient}`}
              >
                <AnimatePresence mode="wait">
                  {isGen ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Generando...
                    </motion.span>
                  ) : isDone ? (
                    <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <CheckCircle2 size={16} /> ¡Listo!
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Download size={16} /> Exportar PDF
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* ── Historial de Reportes Guardados ── */}
      <div className="rounded-[2rem] border border-white/20 bg-slate-950/45 p-6 shadow-2xl mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/10 flex items-center justify-center text-pink-400">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Historial de Reportes Guardados</h2>
              <p className="text-xs text-white/50">
                {reportesFiltrados.length} de {savedReports.length} reporte{savedReports.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Fila 1: buscador + tipo */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre o tipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-slate-800/80 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 transition-all duration-200"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtro por tipo */}
            <div className="relative">
              <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-slate-800/80 border border-white/15 rounded-xl text-sm text-white/80 focus:outline-none focus:border-pink-500/50 transition-all duration-200 appearance-none cursor-pointer min-w-[180px]"
                style={{ backgroundImage: 'none' }}
              >
                <option value="todos" className="bg-slate-900">Todos los tipos</option>
                {REPORTS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900">{r.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: fecha exacta */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <MiniCalendar
              value={fechaFiltro}
              onChange={setFechaFiltro}
              onClear={() => setFechaFiltro('')}
            />

            {/* Limpiar filtros */}
            {(filtroTipo !== 'todos' || busqueda || fechaFiltro) && (
              <button
                onClick={() => { setFiltroTipo('todos'); setBusqueda(''); setFechaFiltro(''); }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-xl text-xs font-bold text-pink-400 transition-all duration-200 whitespace-nowrap"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="responsive-table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Reporte</th>
                <th>Nombre del Archivo</th>
                <th>Fecha de Creación</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {savedReports.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-white/20 italic font-medium">
                    No hay reportes guardados en el sistema. Genera uno para comenzar.
                  </td>
                </tr>
              ) : reportesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="flex flex-col items-center gap-3 text-white/30">
                      <Search size={32} className="opacity-40" />
                      <p className="italic font-medium text-sm">No se encontraron reportes con los filtros aplicados.</p>
                      <button
                        onClick={() => { setFiltroTipo('todos'); setBusqueda(''); }}
                        className="text-pink-400 hover:text-pink-300 text-xs font-bold underline transition"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                reportesFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report) => {
                  const category = REPORTS.find(r => r.id === report.tipo) || {
                    title: 'Reporte',
                    icon: FileText,
                    gradient: 'from-pink-600 to-rose-700',
                  };
                  const ReportIcon = category.icon;
                  return (
                    <tr key={report.id} className="hover:bg-slate-800/80 transition group">
                      <td data-label="Reporte">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                            <ReportIcon size={16} />
                          </div>
                          <span className="font-bold text-white/90">{category.title}</span>
                        </div>
                      </td>
                      <td data-label="Nombre del Archivo" className="text-sm text-white/80 font-medium font-mono">
                        {report.nombre}.pdf
                      </td>
                      <td data-label="Fecha de Creación" className="text-sm text-white/60 font-medium">
                        {new Date(report.creadoEn).toLocaleString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </td>
                      <td data-label="Acciones" className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDownload(report)}
                            disabled={downloadingId === report.id}
                            className="p-2.5 bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-xl transition-all duration-300 border border-white/15 hover:border-emerald-500/30 text-white/60 flex items-center justify-center cursor-pointer disabled:opacity-50"
                            title="Descargar PDF"
                          >
                            {downloadingId === report.id
                              ? <Loader2 size={16} className="animate-spin" />
                              : <Download size={16} />}
                          </button>
                          <button
                            onClick={() => setPreviewReport(report)}
                            className="p-2.5 bg-slate-800/80 hover:bg-pink-500/20 hover:text-pink-400 rounded-xl transition-all duration-300 border border-white/15 hover:border-pink-500/30 text-white/60 cursor-pointer"
                            title="Vista previa del reporte"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2.5 bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all duration-300 border border-white/15 hover:border-rose-500/30 text-white/60 cursor-pointer"
                            title="Eliminar Reporte"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador */}
        {reportesFiltrados.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-white/15">
            <p className="text-xs text-white/50">
              Mostrando <span className="font-bold text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
              <span className="font-bold text-white">
                {Math.min(currentPage * itemsPerPage, reportesFiltrados.length)}
              </span>{' '}
              de <span className="font-bold text-white">{reportesFiltrados.length}</span> reportes
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-slate-800/80 hover:bg-slate-800/90 disabled:opacity-30 disabled:hover:bg-slate-800/80 text-white rounded-xl border border-white/15 transition duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: Math.ceil(reportesFiltrados.length / itemsPerPage) }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 text-xs font-bold rounded-xl transition duration-200 border cursor-pointer ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-none shadow-md shadow-pink-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800/90 text-white/70 hover:text-white border-white/15'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reportesFiltrados.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(reportesFiltrados.length / itemsPerPage)}
                className="p-2 bg-slate-800/80 hover:bg-slate-800/90 disabled:opacity-30 disabled:hover:bg-slate-800/80 text-white rounded-xl border border-white/15 transition duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          SECCIÓN DE IMPRESIÓN (oculta en pantalla)
          Solo visible con window.print()
          ══════════════════════════════════════════════ */}
      {createPortal(
        <div id="print-section">
          {printing === 'general' && data && <PrintGeneral data={data} />}
          {printing === 'financiero' && data && <PrintFinanciero data={data} />}
          {printing === 'alumnos' && data && <PrintAlumnos data={data} />}
          {printing === 'talleres' && data && <PrintTalleres data={data} />}
          {printing === 'actividades' && data && <PrintActividades data={data} />}
        </div>,
        document.body
      )}

      {previewReport && data && (
        <ReportPreviewModal
          report={previewReport}
          data={data}
          onClose={() => setPreviewReport(null)}
          onDownload={generateAndDownloadPdf}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   PLANTILLAS DE IMPRESIÓN
   ══════════════════════════════════════ */

/* ── General ── */
function PrintGeneral({ data: d }) {
  const r = d.resumen;
  return (
    <PrintPage>
      <PrintHeader titulo="REPORTE GENERAL DE ADMINISTRACIÓN" asunto="Reporte General de Administración del Centro Cultural" />
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-4 pt-1 font-sans">
        Por medio de la presente, se hace entrega del reporte general de administración correspondiente al Centro Cultural Huamantla, con información actualizada al día {hoy()}. A continuación se muestra la relación detallada de los registros actuales:
      </p>

      {/* KPIs */}
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-2 mt-3">Resumen Ejecutivo</h3>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          ['Total de Alumnos', r.totalAlumnos],
          ['Alumnos Activos', r.alumnosActivos],
          ['Talleres', r.totalTalleres],
          ['Instructores', r.totalInstructores],
          ['Inscripciones', r.totalInscripciones],
          ['Actividades', r.totalActividades],
          ['Ingresos Totales', fmt(r.ingresosTotales)],
        ].map(([label, val]) => (
          <div key={label} className="border border-neutral-300 rounded p-2 text-center bg-neutral-50">
            <p className="text-base font-black text-[#801D38]">{val}</p>
            <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Talleres top */}
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-1 mt-3">Talleres Registrados</h3>
      <TablaPrint
        headers={['Taller', 'Instructor', 'Alumnos Inscritos', 'Cupo Máx.', 'Disponible', 'Costo Mensual']}
        rows={d.talleres.map(t => [
          t.taller, t.instructor, t.inscritos, t.cupoMaximo,
          t.cupoMaximo - t.inscritos, fmt(t.costo),
        ])}
      />
      
      <PrintSignOff />
    </PrintPage>
  );
}

/* ── Financiero ── */
function PrintFinanciero({ data: d }) {
  const total = d.resumen.ingresosTotales;
  const metodos = Object.entries(d.pagosPorMetodo);
  const meses   = Object.entries(d.pagosPorMes).sort();
  return (
    <PrintPage>
      <PrintHeader titulo="REPORTE FINANCIERO" asunto="Reporte de Ingresos y Métodos de Pago" />
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-4 pt-1 font-sans">
        A continuación se presenta el reporte financiero detallado del Centro Cultural Huamantla con corte al día {hoy()}.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3 mt-2">
        <div className="border border-neutral-300 rounded p-2 text-center bg-neutral-50 col-span-1">
          <p className="text-base font-black text-[#801D38]">{fmt(total)}</p>
          <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">Total Ingresos</p>
        </div>
        <div className="border border-neutral-300 rounded p-2 text-center bg-neutral-50">
          <p className="text-base font-black text-[#801D38]">{d.pagos.length}</p>
          <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">Transacciones</p>
        </div>
        <div className="border border-neutral-300 rounded p-2 text-center bg-neutral-50">
          <p className="text-base font-black text-[#801D38]">{metodos.length}</p>
          <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">Métodos de Pago</p>
        </div>
      </div>

      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-1 mt-3">Ingresos por Método de Pago</h3>
      <TablaPrint
        headers={['Método', 'Total Recaudado', '% del Total']}
        rows={metodos.map(([m, v]) => [
          m.charAt(0).toUpperCase() + m.slice(1),
          fmt(v),
          `${((v / total) * 100).toFixed(1)}%`,
        ])}
      />

      <div className="mt-3" />
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-1 mt-2">Ingresos por Mes</h3>
      <TablaPrint
        headers={['Mes', 'Total Recaudado']}
        rows={meses.map(([m, v]) => [m, fmt(v)])}
      />

      <div className="mt-3" />
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-1 mt-2">Historial de Pagos</h3>
      <TablaPrint
        headers={['Alumno', 'Monto', 'Mes', 'Método', 'Fecha', 'Registrado por']}
        rows={d.pagos.map(p => [
          p.alumno, fmt(p.monto), p.mes,
          p.metodo, fmtD(p.fecha), p.registradoPor,
        ])}
      />

      <PrintSignOff />
    </PrintPage>
  );
}

/* ── Alumnos ── */
function PrintAlumnos({ data: d }) {
  return (
    <PrintPage>
      <PrintHeader titulo="REPORTE DE ALUMNOS" asunto="Listado de Alumnos Inscritos por Taller" />
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-4 pt-1 font-sans">
        A continuación se presenta la relación de alumnos inscritos en los talleres del Centro Cultural Huamantla con corte al {hoy()}.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3 mt-2">
        {[
          ['Total Alumnos', d.resumen.totalAlumnos],
          ['Activos', d.resumen.alumnosActivos],
          ['Inactivos', d.resumen.alumnosInactivos],
        ].map(([l, v]) => (
          <div key={l} className="border border-neutral-300 rounded p-2 text-center bg-neutral-50">
            <p className="text-base font-black text-[#801D38]">{v}</p>
            <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      <TablaPrint
        headers={['#', 'Nombre completo', 'CURP', 'Teléfono', 'Talleres', 'Estatus']}
        rows={d.alumnos.map((a, i) => [
          i + 1, a.nombre, a.curp, a.telefono,
          a.talleres.join(', ') || 'Sin taller',
          a.activo ? 'Activo' : 'Inactivo',
        ])}
      />

      <PrintSignOff />
    </PrintPage>
  );
}

/* ── Talleres e Instructores ── */
function PrintTalleres({ data: d }) {
  return (
    <PrintPage>
      <PrintHeader titulo="REPORTE DE TALLERES E INSTRUCTORES" asunto="Información de Talleres y Personal Docente" />
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-4 pt-1 font-sans">
        A continuación se detalla la información de los talleres activos y el personal docente del Centro Cultural Huamantla al {hoy()}.
      </p>

      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-1 mt-3">Talleres</h3>
      <TablaPrint
        headers={['Taller', 'Instructor', 'Inscritos', 'Cupo Máx.', 'Disponible', 'Costo Mens.', 'Horario']}
        rows={d.talleres.map(t => [
          t.taller, t.instructor, t.inscritos, t.cupoMaximo,
          t.cupoMaximo - t.inscritos, fmt(t.costo), t.horario,
        ])}
      />

      <div className="mt-3" />
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-1 mt-2">Instructores</h3>
      <TablaPrint
        headers={['Nombre', 'Taller Asignado', 'Email', 'Teléfono', 'Estado']}
        rows={d.instructores.map(i => [
          i.nombre, i.taller, i.email, i.telefono, i.estado,
        ])}
      />

      <PrintSignOff />
    </PrintPage>
  );
}

/* ── Actividades ── */
function PrintActividades({ data: d }) {
  return (
    <PrintPage>
      <PrintHeader titulo="REPORTE DE ACTIVIDADES CULTURALES" asunto="Reporte General de Actividades" />
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-4 pt-1 font-sans">
        Por medio de la presente, se hace entrega del reporte oficial correspondiente a las actividades, talleres y eventos internos y externos programados en las distintas áreas de este Centro Cultural (Galería, Audioteca y Auditorio). A continuación se muestra la relación detallada de los registros actuales:
      </p>

      <TablaPrint
        headers={['Título', 'Fecha y Hora', 'Tipo', 'Ubicación', 'Descripción']}
        rows={d.actividades.map(a => [
          a.titulo,
          fmtDL(a.fecha),
          <span key={a.id} className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
            a.tipo === 'interna' 
              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
              : 'bg-violet-500/10 text-violet-700 border border-violet-500/20'
          }`}>
            {a.tipo}
          </span>,
          <span key={a.id + '-ubi'} className="uppercase font-bold text-[#801D38]">{a.ubicacion}</span>,
          a.descripcion || 'Sin descripción',
        ])}
      />

      <PrintSignOff />
    </PrintPage>
  );
}

/* ── Report Preview Modal ── */
function ReportPreviewModal({ report, data, onClose, onDownload }) {
  const [dlLoading, setDlLoading] = useState(false);

  const reportComponent = {
    general: <PrintGeneral data={data} />,
    financiero: <PrintFinanciero data={data} />,
    alumnos: <PrintAlumnos data={data} />,
    talleres: <PrintTalleres data={data} />,
    actividades: <PrintActividades data={data} />,
  };

  const handleDownloadModal = async () => {
    setDlLoading(true);
    try {
      const dateStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        .replace(/ /g, '_').replace(/\./g, '').replace(/,/g, '');
      const filename = `${report.nombre}_${dateStr}.pdf`;
      onClose(); // cerrar modal antes de renderizar la plantilla
      await onDownload(report.tipo, filename);
    } finally {
      setDlLoading(false);
    }
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
        <div className="absolute inset-0 bg-slate-900" onClick={onClose} />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-[900px] max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-white/15 shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/15 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-pink-400" />
              <div>
                <h3 className="text-base font-black text-white">{report.nombre}</h3>
                <p className="text-[10px] text-white/50 font-medium">
                  {new Date(report.creadoEn).toLocaleString('es-MX', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadModal}
                disabled={dlLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-60"
              >
                {dlLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {dlLoading ? 'Descargando...' : 'Descargar PDF'}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-800/90 text-white/50 hover:text-white transition-all duration-200"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Content: Scrollable report preview */}
          <div className="overflow-y-auto bg-[#f5f5f0]">
            <div className="mx-auto max-w-[800px]">
              {reportComponent[report.tipo] || (
                <div className="p-10 text-center text-neutral-500">Tipo de reporte no disponible</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-1.5 border-t border-white/15 bg-slate-900/90 flex items-center justify-between">
            <p className="text-xs text-white/40">Vista previa del reporte · Puede diferir del PDF final</p>
            <button
              onClick={onClose}
              className="text-xs font-bold text-white/50 hover:text-white transition"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
}
