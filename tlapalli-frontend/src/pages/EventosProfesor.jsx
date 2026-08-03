
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
  CalendarDays,
  User,
  Check,
  X,
  Filter,
  Eye
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

const LOCATION_OPTIONS = [
  { value: 'galeria', label: 'Galería', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { value: 'audioteca', label: 'Audioteca', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  { value: 'auditorio', label: 'Auditorio', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'otro', label: 'Otro espacio', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
];

export default function EventosProfesor() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Filtro de estatus para la lista
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos', 'pendiente', 'aprobado', 'rechazado'

  // Calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateString, setSelectedDateString] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Modal proponer / crear evento
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

  // Modal para rechazar evento (Admin)
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEventToReject, setSelectedEventToReject] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  // Modal para ver detalles completos de un evento
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);

  const handleOpenDetailModal = (actividad) => {
    setSelectedEventDetail(actividad);
    setShowDetailModal(true);
  };

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

  // Acciones de Admin (Aprobar y Rechazar)
  const handleAprobar = async (id) => {
    try {
      setActionLoading(id);
      await api.patch(`/actividades/${id}/aprobar`);
      showToast('Evento Aprobado', 'El evento ha sido aprobado exitosamente y ya está publicado.', 'success');
      setShowDetailModal(false);
      await fetchActividades();
    } catch (err) {
      console.error(err);
      showToast('Error', err.response?.data?.message || 'No se pudo aprobar el evento', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (actividad) => {
    setSelectedEventToReject(actividad);
    setObservaciones('');
    setShowRejectModal(true);
    setShowDetailModal(false);
  };

  const handleRechazar = async (e) => {
    e.preventDefault();
    if (!selectedEventToReject) return;

    try {
      setSaving(true);
      await api.patch(`/actividades/${selectedEventToReject.id}/rechazar`, { observaciones });
      showToast('Evento Rechazado', 'La propuesta de evento ha sido rechazada.', 'info');
      setShowRejectModal(false);
      setSelectedEventToReject(null);
      setObservaciones('');
      await fetchActividades();
    } catch (err) {
      console.error(err);
      showToast('Error al rechazar', err.response?.data?.message || 'No se pudo rechazar el evento', 'error');
    } finally {
      setSaving(false);
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
      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha: new Date(fullDateTime).toISOString(),
        tipo: formData.tipo,
        ubicacion: formData.ubicacion,
      };

      if (isAdmin) {
        // Admin crea evento directamente aprobado
        await api.post('/actividades', payload);
        showToast('Evento Creado', 'El evento fue creado y publicado directamente.', 'success');
      } else {
        // Profesor propone evento
        await api.post('/actividades/proponer', payload);
        showToast('Propuesta enviada', 'Tu propuesta de evento se registró y está pendiente de aprobación por el Administrador.', 'success');
      }

      setShowModal(false);
      await fetchActividades();
    } catch (err) {
      console.error(err);
      showToast('Error al guardar', err.response?.data?.message || 'No se pudo guardar la actividad', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtrar eventos por fecha seleccionada y filtro de estatus
  const actividadesDelDia = useMemo(() => {
    return actividades.filter(act => {
      const actDate = new Date(act.fecha);
      const actStr = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, '0')}-${String(actDate.getDate()).padStart(2, '0')}`;
      const matchesDate = actStr === selectedDateString;
      const matchesFilter = statusFilter === 'todos' || act.estatus === statusFilter;
      return matchesDate && matchesFilter;
    });
  }, [actividades, selectedDateString, statusFilter]);

  // Lista de solicitudes pendientes de aprobación (para Admin)
  const pendientesAprobacion = useMemo(() => {
    return actividades.filter(a => a.estatus === 'pendiente');
  }, [actividades]);

  // Contadores de estatus
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
            {isAdmin ? 'Gestión de Eventos y Calendario' : 'Mis Eventos y Propuestas'}
          </h1>
          <p className="mt-1 text-base font-semibold text-white/75">
            {isAdmin
              ? 'Revisa y aprueba solicitudes de eventos de profesores o crea eventos institucionales'
              : 'Propón actividades culturales y consulta el calendario confirmado'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenProponerModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-pink-600/30 cursor-pointer"
        >
          <Plus size={18} /> {isAdmin ? 'Crear Evento Oficial' : 'Proponer Nuevo Evento'}
        </motion.button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CalendarDays} label="Confirmados" value={stats.aprobados} color="purple" />
        <StatCard icon={Clock} label="Pendientes de Aprobación" value={stats.pendientes} color="yellow" />
        <StatCard icon={XCircle} label="Rechazados / Cancelados" value={stats.rechazados} color="rose" />
      </div>

      {/* Sección exclusiva de Admin: Solicitudes Pendientes por Aprobar */}
      {isAdmin && pendientesAprobacion.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-200 flex items-center gap-2">
                  Solicitudes Pendientes por Aprobar
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
                    {pendientesAprobacion.length}
                  </span>
                </h3>
                <p className="text-xs text-amber-300/70 font-semibold">
                  Los profesores han enviado propuestas de eventos que requieren tu autorización.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendientesAprobacion.map((act) => {
              const actDate = new Date(act.fecha);
              const fechaFormatted = actDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
              const actTime = actDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
              const instructorNombre = act.instructor?.nombre || act.instructor?.usuario?.nombre || 'Profesor sin asignar';

              return (
                <motion.div
                  key={act.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenDetailModal(act)}
                  className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-400/70 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg cursor-pointer transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold border-b border-white/5 pb-2">
                      <span className="flex items-center gap-1.5 truncate">
                        <User size={13} className="text-amber-300" /> {instructorNombre}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-black text-[10px]">
                          PENDIENTE
                        </span>
                        <span className="text-[10px] text-amber-300/80 group-hover:text-amber-200 transition flex items-center gap-0.5 font-bold">
                          <Eye size={12} /> Ver todo
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-white text-base leading-snug group-hover:text-amber-200 transition-colors">{act.titulo}</h4>
                    {act.descripcion && (
                      <p className="text-xs text-white/60 line-clamp-2">{act.descripcion}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={12} className="text-pink-400" /> {fechaFormatted}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-sky-400" /> {actTime} hrs
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white/50 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-400" /> Ubicación: <span className="text-white/80 font-bold capitalize">{act.ubicacion}</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                        Leer todo &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Acciones Aprobar / Rechazar */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAprobar(act.id);
                      }}
                      disabled={actionLoading === act.id}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      {actionLoading === act.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Aprobar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRejectModal(act);
                      }}
                      disabled={actionLoading === act.id}
                      className="flex-1 py-2 px-3 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X size={14} /> Rechazar
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

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
        <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="font-black text-white text-lg">Eventos del Día</h3>
                <p className="text-xs text-white/50 font-bold">{selectedDateString}</p>
              </div>
              <button
                onClick={handleOpenProponerModal}
                className="p-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-xl transition"
                title="Proponer o crear para este día"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Filtro de Estatus */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'pendiente', label: 'Pendientes' },
                { id: 'aprobado', label: 'Aprobados' },
                { id: 'rechazado', label: 'Rechazados' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition capitalize whitespace-nowrap ${statusFilter === f.id
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-slate-800 text-white/50 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
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

                  const instructorNombre = act.instructor?.nombre || act.instructor?.usuario?.nombre;

                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleOpenDetailModal(act)}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-white/15 hover:border-pink-500/40 rounded-2xl p-4 space-y-2 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                        <span className="text-[10px] text-white/50 font-bold flex items-center gap-1">
                          <Clock size={10} /> {actTime} hrs
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm group-hover:text-pink-300 transition-colors flex items-center justify-between">
                        <span>{act.titulo}</span>
                        <Eye size={14} className="text-white/30 group-hover:text-pink-400 transition" />
                      </h4>
                      {act.descripcion && (
                        <p className="text-xs text-white/60 line-clamp-2">{act.descripcion}</p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-white/40 font-bold pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} className="text-pink-400" /> {act.ubicacion}
                        </span>
                        {instructorNombre && (
                          <span className="flex items-center gap-1 text-amber-300/80">
                            <User size={10} /> {instructorNombre}
                          </span>
                        )}
                      </div>

                      {act.observacionesAdmin && (
                        <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-200">
                          <span className="font-bold block text-rose-300">Nota del Administrador:</span>
                          {act.observacionesAdmin}
                        </div>
                      )}

                      {/* Si es admin y el evento está pendiente, ofrecer aprobar/rechazar desde la lista del día */}
                      {isAdmin && act.estatus === 'pendiente' && (
                        <div className="flex gap-2 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAprobar(act.id);
                            }}
                            disabled={actionLoading === act.id}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <Check size={12} /> Aprobar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRejectModal(act);
                            }}
                            disabled={actionLoading === act.id}
                            className="flex-1 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/30 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <X size={12} /> Rechazar
                          </button>
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

      {/* Modal de Propuesta / Creación de Evento */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isAdmin ? "Crear Evento Oficial" : "Proponer Nuevo Evento / Actividad"}
        maxWidth="max-w-md"
      >
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
            <span>
              {isAdmin
                ? 'Como Administrador, este evento se publicará de manera oficial de forma directa.'
                : 'Al enviar la propuesta, el evento se enviará al Administrador para su aprobación antes de publicarse oficialmente.'}
            </span>
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
              className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 disabled:opacity-50 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/20 cursor-pointer"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : (isAdmin ? 'Crear Evento' : 'Enviar Propuesta')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para Rechazar Evento (Admin) */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Rechazar Propuesta de Evento"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRechazar} className="space-y-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-200">
            <span className="font-bold block text-rose-300">Evento: {selectedEventToReject?.titulo}</span>
            <span>Estás a punto de rechazar esta propuesta. Puedes indicarle al profesor el motivo o sugerencias.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 uppercase mb-1.5">Observaciones / Motivo de Rechazo</label>
            <textarea
              rows="3"
              placeholder="Ej. El espacio ya está ocupado en ese horario. Por favor propón otra fecha..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-rose-500 text-xs resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Rechazo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Detalle Completo de Evento */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalles de la Solicitud / Evento"
        maxWidth="max-w-lg"
      >
        {selectedEventDetail && (() => {
          const actDate = new Date(selectedEventDetail.fecha);
          const fechaFormatted = actDate.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          const actTime = actDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
          const instructorNombre = selectedEventDetail.instructor?.nombre || selectedEventDetail.instructor?.usuario?.nombre || 'Profesor sin asignar';

          let statusBadge = { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: '🟢 Aprobado' };
          if (selectedEventDetail.estatus === 'pendiente') statusBadge = { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: '🟡 Pendiente de Aprobación' };
          else if (selectedEventDetail.estatus === 'rechazado') statusBadge = { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: '🔴 Rechazado' };
          else if (selectedEventDetail.estatus === 'cancelado') statusBadge = { bg: 'bg-gray-500/20 text-gray-300 border-gray-500/30', label: '❌ Cancelado' };

          return (
            <div className="space-y-5 text-white">
              {/* Banner Superior Estatus e Instructor */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
                <div className="text-xs text-white/80 font-semibold flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10">
                  <User size={14} className="text-amber-400" />
                  <span>Propuesto por: <strong className="text-amber-300 font-bold">{instructorNombre}</strong></span>
                </div>
              </div>

              {/* Título Principal */}
              <div>
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block mb-1">
                  Actividad {selectedEventDetail.tipo || 'Cultural'}
                </span>
                <h3 className="text-xl font-black text-white leading-tight">
                  {selectedEventDetail.titulo}
                </h3>
              </div>

              {/* Información de Fecha, Hora y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/80 border border-white/10 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Fecha</p>
                    <p className="text-xs font-bold text-white capitalize">{fechaFormatted}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Hora</p>
                    <p className="text-xs font-bold text-white">{actTime} hrs</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:col-span-2 border-t border-white/5 pt-2 mt-1">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Espacio / Ubicación</p>
                    <p className="text-xs font-bold text-emerald-300 capitalize">{selectedEventDetail.ubicacion}</p>
                  </div>
                </div>
              </div>

              {/* Descripción Completa sin truncar */}
              <div>
                <h4 className="text-xs font-bold text-white/70 uppercase mb-2 flex items-center gap-1.5">
                  <Info size={14} className="text-pink-400" /> Descripción Completa
                </h4>
                <div className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl text-xs text-white/90 leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                  {selectedEventDetail.descripcion || 'Sin descripción detallada.'}
                </div>
              </div>

              {/* Observaciones del Administrador si existen */}
              {selectedEventDetail.observacionesAdmin && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-1">
                  <p className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                    <AlertCircle size={15} /> Observaciones del Administrador
                  </p>
                  <p className="text-xs text-rose-100/90 leading-relaxed">
                    {selectedEventDetail.observacionesAdmin}
                  </p>
                </div>
              )}

              {/* Acciones de Administrador dentro del modal si está pendiente */}
              {isAdmin && selectedEventDetail.estatus === 'pendiente' && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-amber-200 text-center">
                    Como administrador, puedes responder a esta solicitud directamente desde aquí:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAprobar(selectedEventDetail.id)}
                      disabled={actionLoading === selectedEventDetail.id}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      {actionLoading === selectedEventDetail.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Aprobar Solicitud
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(selectedEventDetail)}
                      disabled={actionLoading === selectedEventDetail.id}
                      className="flex-1 py-2.5 px-3 bg-rose-600/40 hover:bg-rose-600/60 text-rose-100 border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X size={16} /> Rechazar Solicitud
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de Cerrar */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
