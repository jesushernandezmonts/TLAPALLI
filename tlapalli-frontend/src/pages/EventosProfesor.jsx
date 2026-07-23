import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';

const LOCATION_OPTIONS = [
  { value: 'galeria', label: 'Galería', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { value: 'audioteca', label: 'Audioteca', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  { value: 'auditorio', label: 'Auditorio', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'otro', label: 'Otro espacio', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
];

export default function EventosProfesor() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateString, setSelectedDateString] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Modal proponer evento
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '10:00',
    tipo: 'interna',
    ubicacion: 'galeria',
  });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (title, message = '', type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/actividades');
      setActividades(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de días del mes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${year}-${monthStr}-${dayStr}`;
    setSelectedDateString(fullDate);
  };

  const handleOpenProponerModal = () => {
    setFormData(prev => ({
      ...prev,
      fecha: selectedDateString || new Date().toISOString().split('T')[0],
      hora: '10:00',
      titulo: '',
      descripcion: '',
    }));
    setShowModal(true);
  };

  const handleSavePropuesta = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      showToast('Campo requerido', 'Debes ingresar el título del evento.', 'error');
      return;
    }

    try {
      setSaving(true);
      const fullDateTime = `${formData.fecha}T${formData.hora}:00`;
      
      await api.post('/actividades/proponer', {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha: new Date(fullDateTime).toISOString(),
        tipo: formData.tipo,
        ubicacion: formData.ubicacion,
      });

      showToast('Propuesta enviada', 'Tu propuesta de evento se registró y está pendiente de aprobación por el Administrador.', 'success');
      setShowModal(false);
      await fetchActividades();
    } catch (err) {
      console.error(err);
      showToast('Error al proponer', err.response?.data?.message || 'No se pudo enviar la propuesta', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtrar eventos por fecha seleccionada
  const actividadesDelDia = useMemo(() => {
    return actividades.filter(act => {
      const actDate = new Date(act.fecha);
      const actStr = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}-${String(actDate.getDate()).padStart(2, '0')}`;
      return actStr === selectedDateString;
    });
  }, [actividades, selectedDateString]);

  // Contadores de estatus del profesor
  const stats = useMemo(() => {
    const pendientes = actividades.filter(a => a.estatus === 'pendiente').length;
    const aprobados = actividades.filter(a => a.estatus === 'aprobado').length;
    const rechazados = actividades.filter(a => a.estatus === 'rechazado' || a.estatus === 'cancelado').length;
    return { pendientes, aprobados, rechazados };
  }, [actividades]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
        <p className="text-white/40 text-sm">Cargando eventos y calendario...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      {/* Cabecera */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.65)]">
            Mis Eventos y Propuestas
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75">
            Propón actividades culturales y consulta el calendario confirmado
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenProponerModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-pink-600/30 cursor-pointer"
        >
          <Plus size={18} /> Proponer Nuevo Evento
        </motion.button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CalendarDays} label="Confirmados" value={stats.aprobados} color="purple" />
        <StatCard icon={Clock} label="Pendientes" value={stats.pendientes} color="yellow" />
        <StatCard icon={XCircle} label="Rechazados/Cancelados" value={stats.rechazados} color="rose" />
      </div>

      {/* Layout de Calendario + Panel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario (Columna izquierda 2/3) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {/* Navegación del mes */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white capitalize flex items-center gap-2">
              <CalendarIcon className="text-pink-500" size={22} />
              {currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white/70 hover:text-white rounded-xl transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white/70 hover:text-white rounded-xl transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center text-xs font-black text-white/30 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grilla de días */}
          <div className="grid grid-cols-7 gap-2">
            {padding.map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const monthStr = String(month + 1).padStart(2, '0');
              const dayStr = String(day).padStart(2, '0');
              const fullDateStr = `${year}-${monthStr}-${dayStr}`;
              
              const isToday = new Date().toISOString().split('T')[0] === fullDateStr;
              const isSelected = selectedDateString === fullDateStr;

              const dayEvents = actividades.filter(act => {
                const actDate = new Date(act.fecha);
                const actStr = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}-${String(actDate.getDate()).padStart(2, '0')}`;
                return actStr === fullDateStr;
              });

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative cursor-pointer select-none transition-all p-1
                    ${isToday 
                      ? 'bg-gradient-to-br from-pink-600 to-orange-600 border-pink-400 text-white shadow-lg shadow-pink-500/20'
                      : isSelected
                      ? 'bg-slate-800 border-white/40 text-white ring-2 ring-pink-500/50'
                      : 'bg-slate-800/60 border-slate-800 hover:border-white/20 text-white/80'
                    }`}
                >
                  <span className="text-sm font-black">{day}</span>

                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1.5 flex gap-1 justify-center w-full">
                      {dayEvents.slice(0, 3).map((act, idx) => {
                        let dotColor = 'bg-emerald-400';
                        if (act.estatus === 'pendiente') dotColor = 'bg-amber-400 animate-pulse';
                        else if (act.estatus === 'rechazado' || act.estatus === 'cancelado') dotColor = 'bg-rose-500';
                        return (
                          <span key={act.id || idx} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detalle del Día Seleccionado (Columna derecha 1/3) */}
        <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="font-black text-white text-lg">Eventos del Día</h3>
                <p className="text-xs text-white/50 font-bold">{selectedDateString}</p>
              </div>
              <button
                onClick={handleOpenProponerModal}
                className="p-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-xl transition"
                title="Proponer para este día"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {actividadesDelDia.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays size={40} className="mx-auto text-white/20 mb-3" />
                  <p className="text-white/40 text-xs font-bold">No hay eventos programados para este día</p>
                </div>
              ) : (
                actividadesDelDia.map(act => {
                  const actTime = new Date(act.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
                  let statusBadge = { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: '🟢 Aprobado' };
                  if (act.estatus === 'pendiente') statusBadge = { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: '🟡 Pendiente' };
                  else if (act.estatus === 'rechazado') statusBadge = { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: '🔴 Rechazado' };
                  else if (act.estatus === 'cancelado') statusBadge = { bg: 'bg-gray-500/20 text-gray-300 border-gray-500/30', label: '❌ Cancelado' };

                  return (
                    <motion.div 
                      key={act.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/80 border border-white/15 rounded-2xl p-4 space-y-2 hover:bg-slate-800 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                        <span className="text-[10px] text-white/50 font-bold flex items-center gap-1">
                          <Clock size={10} /> {actTime} hrs
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm">{act.titulo}</h4>
                      {act.descripcion && (
                        <p className="text-xs text-white/60 line-clamp-2">{act.descripcion}</p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-white/40 font-bold pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} className="text-pink-400" /> {act.ubicacion}
                        </span>
                      </div>

                      {act.observacionesAdmin && (
                        <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-200">
                          <span className="font-bold block text-rose-300">Nota del Administrador:</span>
                          {act.observacionesAdmin}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Propuesta de Evento */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Proponer Nuevo Evento / Actividad" maxWidth="max-w-md">
        <form onSubmit={handleSavePropuesta} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/70 uppercase mb-1.5">Título del Evento *</label>
            <input
              type="text"
              required
              placeholder="Ej. Exposición de Pintura al Óleo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1.5">Fecha *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-white focus:outline-none focus:border-pink-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-1.5">Hora *</label>
              <input
                type="time"
                required
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-white focus:outline-none focus:border-pink-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 uppercase mb-1.5">Espacio / Ubicación *</label>
            <select
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:outline-none focus:border-pink-500 text-xs font-medium"
            >
              <option value="galeria">Galería</option>
              <option value="audioteca">Audioteca</option>
              <option value="auditorio">Auditorio</option>
              <option value="otro">Otro Espacio</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 uppercase mb-1.5">Motivo / Descripción</label>
            <textarea
              rows="3"
              placeholder="Explica brevemente el propósito de la actividad..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 text-xs resize-none"
            />
          </div>

          <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-xs text-pink-200 flex items-start gap-2">
            <Info size={16} className="text-pink-400 flex-shrink-0 mt-0.5" />
            <span>Al enviar la propuesta, el evento se enviará al Administrador para su aprobación antes de publicarse oficialmente.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 disabled:opacity-50 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/20"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Enviar Propuesta'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
