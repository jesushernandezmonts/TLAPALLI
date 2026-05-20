import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, TrendingUp, Users, BookOpen, Calendar,
  Download, Loader2, AlertCircle, RefreshCw, CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
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
    <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
      <div className="text-center flex flex-col items-center select-none">
        <Flower className="w-14 h-14 text-[#801D38]" />
        <div className="text-[#801D38] font-black text-lg tracking-[0.2em] leading-none mt-2">TLAXCALA</div>
        <div className="text-[8px] font-black text-[#D4AF37] tracking-[0.1em] mt-1.5">UNA NUEVA HISTORIA</div>
        <div className="text-[7px] font-bold text-neutral-400 tracking-[0.2em] mt-0.5">2021 - 2027</div>
      </div>
      <div className="text-center flex flex-col items-center pt-2">
        <p className="font-black text-neutral-900 text-sm uppercase tracking-tight">{titulo}</p>
        <p className="text-[10px] text-neutral-500 mt-1">Centro Cultural Huamantla</p>
      </div>
      <div className="text-right text-[10px] text-neutral-600 leading-normal font-sans">
        <p className="font-bold text-neutral-900 text-xs uppercase tracking-tight">Centro Cultural Huamantla</p>
        <p>Parque Juárez No.14</p>
        <p>Tel: 2 47 47 2 13 11</p>
        <p className="font-semibold text-[#801D38] mt-1">Área: Coordinación</p>
      </div>
    </div>
    <div className="text-right text-xs space-y-1 pt-2 font-sans">
      <p className="font-bold text-neutral-900">Asunto: <span className="font-medium text-neutral-700">{asunto}</span></p>
      <p className="text-neutral-500">Huamantla, Tlax., a {hoy()}</p>
    </div>
    <div className="text-xs pt-4 font-sans">
      <p className="font-black text-neutral-900 uppercase">C. COORDINADOR DEL CENTRO CULTURAL HUAMANTLA</p>
      <p className="font-black text-[#801D38] tracking-[0.2em] mt-1">P R E S E N T E .</p>
    </div>
  </>
);

const PrintFooter = () => (
  <div className="border-t border-neutral-200 pt-6 flex justify-between items-center text-[8px] text-neutral-400 z-10 font-sans">
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
    <div className="flex h-2.5 w-full">
      <div className="bg-[#4D8C3E] w-1/3" />
      <div className="bg-[#F29C38] w-1/3" />
      <div className="bg-[#8A244E] w-1/3" />
    </div>

    <div className="p-16 relative bg-white select-text">
      {/* Faded Watermark in background */}
      <div className="watermark-print opacity-[0.03] pointer-events-none select-none">
        <Flower className="w-[600px] h-[600px] text-[#801D38]" />
      </div>
      
      <div className="relative z-10 space-y-6">
        {children}
      </div>

      <PrintFooter />
    </div>
  </div>
);

const PrintSignOff = () => (
  <div className="pt-16 text-center text-xs space-y-14 font-sans">
    <p className="font-bold text-neutral-700 uppercase tracking-widest">A t e n t a m e n t e</p>
    <div>
      <p className="font-bold text-neutral-950">Mtro. Manuel de la Vega Moreno</p>
      <p className="text-neutral-500">Coordinador de Centro Cultural Huamantla</p>
    </div>
  </div>
);

const TablaPrint = ({ headers, rows }) => (
  <div className="pt-4">
    <table className="w-full text-left text-[10px] border-collapse border border-neutral-300 font-sans">
      <thead>
        <tr className="bg-[#801D38] text-white font-bold uppercase tracking-wider text-[9px]">
          {headers.map((h, idx) => <th key={idx} className="border border-neutral-300 p-2.5">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200">
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="p-8 text-center text-neutral-400 italic">No se encontraron registros.</td></tr>
        ) : rows.map((cells, i) => (
          <tr key={i} className="hover:bg-neutral-50/50">
            {cells.map((c, j) => (
              <td key={j} className={`border border-neutral-300 p-2.5 ${j === 0 ? 'font-bold text-neutral-900' : 'text-neutral-600'}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ─── componente principal ────────────────────────────────────────────────── */
export default function Reportes() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [printing, setPrinting] = useState(null); // id del reporte activo en print
  const [generating, setGenerating] = useState(null);
  const [done, setDone]         = useState(null);

  useEffect(() => { fetchData(); }, []);

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
    await new Promise(r => setTimeout(r, 350)); // esperar render
    window.print();
    setGenerating(null);
    setDone(id);
    setTimeout(() => { setDone(null); setPrinting(null); }, 2500);
  };

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
          <h1 className="text-2xl font-bold text-white/90">Reportes</h1>
          <p className="text-white/40 text-sm mt-1">Genera y descarga reportes oficiales en PDF</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-xs font-bold transition"
        >
          <RefreshCw size={14} /> Actualizar datos
        </button>
      </div>

      {/* ── KPI bar ── */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-center">
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
              className={`relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 overflow-hidden ring-1 ${r.ring} transition-all duration-300`}
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
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-8 pt-2 font-sans">
        Por medio de la presente, se hace entrega del reporte general de administración correspondiente al Centro Cultural Huamantla, con información actualizada al día {hoy()}. A continuación se muestra la relación detallada de los registros actuales:
      </p>

      {/* KPIs */}
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-3 mt-4">Resumen Ejecutivo</h3>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          ['Total de Alumnos', r.totalAlumnos],
          ['Alumnos Activos', r.alumnosActivos],
          ['Talleres', r.totalTalleres],
          ['Instructores', r.totalInstructores],
          ['Inscripciones', r.totalInscripciones],
          ['Actividades', r.totalActividades],
          ['Ingresos Totales', fmt(r.ingresosTotales)],
        ].map(([label, val]) => (
          <div key={label} className="border border-neutral-300 rounded p-3 text-center bg-neutral-50">
            <p className="text-base font-black text-[#801D38]">{val}</p>
            <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Talleres top */}
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-2 mt-4">Talleres Registrados</h3>
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
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-8 pt-2 font-sans">
        A continuación se presenta el reporte financiero detallado del Centro Cultural Huamantla con corte al día {hoy()}.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5 mt-4">
        <div className="border border-neutral-300 rounded p-3 text-center bg-neutral-50 col-span-1">
          <p className="text-base font-black text-[#801D38]">{fmt(total)}</p>
          <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">Total Ingresos</p>
        </div>
        <div className="border border-neutral-300 rounded p-3 text-center bg-neutral-50">
          <p className="text-base font-black text-[#801D38]">{d.pagos.length}</p>
          <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">Transacciones</p>
        </div>
        <div className="border border-neutral-300 rounded p-3 text-center bg-neutral-50">
          <p className="text-base font-black text-[#801D38]">{metodos.length}</p>
          <p className="text-[9px] text-neutral-500 uppercase tracking-wide mt-0.5">Métodos de Pago</p>
        </div>
      </div>

      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-2 mt-4">Ingresos por Método de Pago</h3>
      <TablaPrint
        headers={['Método', 'Total Recaudado', '% del Total']}
        rows={metodos.map(([m, v]) => [
          m.charAt(0).toUpperCase() + m.slice(1),
          fmt(v),
          `${((v / total) * 100).toFixed(1)}%`,
        ])}
      />

      <div className="mt-6" />
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-2 mt-4">Ingresos por Mes</h3>
      <TablaPrint
        headers={['Mes', 'Total Recaudado']}
        rows={meses.map(([m, v]) => [m, fmt(v)])}
      />

      <div className="mt-6" />
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-2 mt-4">Historial de Pagos</h3>
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
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-8 pt-2 font-sans">
        A continuación se presenta la relación de alumnos inscritos en los talleres del Centro Cultural Huamantla con corte al {hoy()}.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5 mt-4">
        {[
          ['Total Alumnos', d.resumen.totalAlumnos],
          ['Activos', d.resumen.alumnosActivos],
          ['Inactivos', d.resumen.alumnosInactivos],
        ].map(([l, v]) => (
          <div key={l} className="border border-neutral-300 rounded p-3 text-center bg-neutral-50">
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
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-8 pt-2 font-sans">
        A continuación se detalla la información de los talleres activos y el personal docente del Centro Cultural Huamantla al {hoy()}.
      </p>

      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-2 mt-4">Talleres</h3>
      <TablaPrint
        headers={['Taller', 'Instructor', 'Inscritos', 'Cupo Máx.', 'Disponible', 'Costo Mens.', 'Horario']}
        rows={d.talleres.map(t => [
          t.taller, t.instructor, t.inscritos, t.cupoMaximo,
          t.cupoMaximo - t.inscritos, fmt(t.costo), t.horario,
        ])}
      />

      <div className="mt-6" />
      <h3 className="font-black text-[#801D38] uppercase tracking-widest text-[9px] mb-2 mt-4">Instructores</h3>
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
      <p className="text-xs text-neutral-700 leading-relaxed text-justify indent-8 pt-2 font-sans">
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
